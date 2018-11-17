import { Context } from 'koa'
import { stringify } from 'querystring'
import {
    BadRequestError,
    Body,
    Ctx,
    Get,
    HttpError,
    JsonController,
    NotFoundError,
    Param,
    Post,
    QueryParam,
    Req,
    Res,
    UseBefore
} from 'routing-controllers'
import { Inject } from 'typedi'
import { parse } from 'url'
import { FiscalChequeRequest } from '../common/fiscalChequeRequest'
import { ECOM_PASS, ECOM_URL, ECOM_USER } from '../config/env.config'
import logger from '../config/logger.config'
import { createEcomOrder } from '../ecom/ecomOrder'
import { EcomService } from '../ecom/ecomService'
import { PayType } from '../ecom/payType'
import { ManzanaPosService } from '../manzana/manzanaPosService'
import { ManzanaSession } from '../manzana/manzanaSession'
import { ManzanaUserApiClient } from '../manzana/manzanaUserApiClient'
import { ProxyMiddleware } from '../middlewares/proxy.middleware'
import { Order } from '../mongo/entity/order'
import { OrdersRepository } from '../mongo/repository/orders'
import { StoreRepository } from '../mongo/repository/stores'
import { SbolCallback } from '../parameters/sbolCallback'
import { StatusCode } from '../sbol/orderStatusResponse'
import { PreAuthResponse } from '../sbol/preAuthResponse'
import { SbolService } from '../sbol/sbolService'

const ECOM_BASIC_AUTH_TOKEN = Buffer.from(`${ECOM_USER}:${ECOM_PASS}`).toString('base64')
const PARAM_ORDER_ID = 'orderNumber'
const PARAM_SBOL_REDIRECT_RESULT = 'success'

@JsonController('/orders')
export class OrdersController {
    @Inject()
    private readonly sbolService!: SbolService
    @Inject()
    private readonly ordersRepository!: OrdersRepository
    @Inject()
    private readonly ecom!: EcomService
    @Inject()
    private readonly manzanaPosService!: ManzanaPosService
    @Inject()
    private readonly stores!: StoreRepository

    @Get()
    @UseBefore(
        ProxyMiddleware(ECOM_URL, {
            headers: {
                Authorization: `Basic ${ECOM_BASIC_AUTH_TOKEN}`
            },
            proxyReqPathResolver: async (ctx: Context) => {
                const manzana = ManzanaUserApiClient.create(new ManzanaSession(ctx.query.sessionid, ctx.query.id))
                const user = await manzana.getCurrentUser()
                // use proxied url path with parameters
                const pathPrefix = parse(ECOM_URL).pathname
                const path = `${pathPrefix}/clients/${user.MobilePhone}/orders`
                const ecomParams = {
                    fields: 'id,date,storeId,statusId,payType',
                    expand: 'basket,statuses'
                }
                // blend original & pre-defined params
                const params = { ...ecomParams, ...ctx.query }
                // delete manzana related query params (ecom dies otherwise)
                delete params.sessionid
                delete params.id
                const newPath = `${path}?${stringify(params)}`
                logger.info(`proxied path: ${newPath}`)
                return newPath
            }
        })
    )
    public async getAll(@Req() request: any, @Res() response: any) {
        return response
    }

    @Get('/statuses')
    @UseBefore(
        ProxyMiddleware(`${ECOM_URL}order_statuses`, {
            headers: {
                Authorization: `Basic ${ECOM_BASIC_AUTH_TOKEN}`
            }
        })
    )
    public async getStatuses(@Req() request: any, @Res() response: any) {
        return response
    }

    @Post('/submit/:payType')
    public async postFiscalCheque(
        @Param('payType') payType: number,
        @Ctx() ctx: Context,
        @Body() request: FiscalChequeRequest
    ): Promise<Order & { id: number } | PreAuthResponse> {
        const cheque = await this.manzanaPosService.getCheque(request)
        const storeInn = await this.stores.getInn(request.storeId)
        if (!storeInn) {
            throw new NotFoundError('store with this id not found')
        }
        // store order in local db and assign local id
        const order = await this.ordersRepository.insert(createEcomOrder(request, cheque, payType, storeInn.INN))

        switch (order.payType) {
            case PayType.CASH:
                return this.submitToEcomAndSaveOrder(order)
            case PayType.ONLINE:
                return this.sbolService.registerPreAuth({
                    orderNumber: order.extId,
                    failUrl: this.getRedirectUrl(order.extId, false),
                    returnUrl: this.getRedirectUrl(order.extId, true),
                    description: `Авторизация заказа из мобильного приложения`,
                    amount: cheque.amount * 100,
                    clientId: request.clientTel,
                    INN: order.INN,
                    pageView: 'DESKTOP'
                })
            default:
                throw new BadRequestError(`payType ${order.payType} not supported`)
        }
    }

    @Post('/submit/1/callback')
    public async processSbolCallback(@Body() sbolCallback: SbolCallback): Promise<Order & { id: number }> {
        const order = await this.ordersRepository.findById(sbolCallback.orderNumber)
        if (!order) {
            throw new NotFoundError('no authorized payment with this id')
        }
        if (order.id) {
            throw new BadRequestError(`Order ${order.extId} has already been submitted to e-ecom as ${order.id}`)
        }
        const status = await this.sbolService.getOrderStatus({
            orderNumber: sbolCallback.orderNumber,
            INN: order.INN
        });
        if (status.orderStatus === StatusCode.PREAUTHORIZED) {
            // successfully pre-authorized - post to ecom
            return this.submitToEcomAndSaveOrder(order)
        } else {
            const err = new HttpError(402, status.actionCodeDescription)
            throw Object.assign(err, status) // send status to user
        }
    }

    private async submitToEcomAndSaveOrder(order: Order): Promise<Order & { id: number }> {
        logger.debug(JSON.stringify(order))
        const res = await this.ecom.submitOrder(order)
        await this.ordersRepository.updateById(order.extId, { id: res.orderId })
        return {
            ...order,
            id: res.orderId
        }
    }

    private getRedirectUrl(orderNumber: string, success: boolean) {
        const params: any = {}
        params[PARAM_ORDER_ID] = orderNumber
        params[PARAM_SBOL_REDIRECT_RESULT] = success
        return `http://xcom.gateway.result?${stringify(params)}`
    }
}
