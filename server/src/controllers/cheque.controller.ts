import {
    BadRequestError,
    Body,
    Ctx,
    Get,
    HttpCode,
    HttpError,
    JsonController,
    NotFoundError,
    Param,
    Post,
    QueryParam
} from 'routing-controllers'
import { Inject } from 'typedi'

import { Context } from 'koa'
import { stringify } from 'querystring'
import { FiscalChequeRequest } from '../common/fiscalChequeRequest'
import { InvalidCoupon } from '../common/invalidCoupon'
import { SoftChequeRequest } from '../common/softChequeRequest'
import { createEcomOrder } from '../ecom/ecomOrder'
import { EcomService } from '../ecom/ecomService'
import { PayType } from '../ecom/payType'
import { ManzanaCheque } from '../manzana/manzanaCheque'
import { ManzanaPosService } from '../manzana/manzanaPosService'
import { OrdersRepository } from '../mongo/repository/orders'
import { INN, StoreRepository } from '../mongo/repository/stores'
import { StatusCode } from '../sbol/orderStatusResponse'
import { SbolService } from '../sbol/sbolService'

const PARAM_ORDER_ID = 'orderNumber'
const PARAM_SBOL_REDIRECT_RESULT = 'success'

@JsonController('/cheque')
export class ChequeController {
    @Inject()
    private readonly manzanaPosService!: ManzanaPosService
    @Inject()
    private readonly sbolService!: SbolService
    @Inject()
    private readonly ordersRepository!: OrdersRepository
    @Inject()
    private readonly ecom!: EcomService
    @Inject()
    private readonly stores!: StoreRepository

    @Post('/soft')
    @HttpCode(200)
    public async handleSoftCheque(@Body() request: SoftChequeRequest): Promise<ManzanaCheque | InvalidCoupon[]> {
        return this.manzanaPosService.getCheque(request)
    }

    @Post('/fiscal')
    public async postFiscalCheque(@Ctx() ctx: Context, @Body() request: FiscalChequeRequest) {
        const cheque = (await this.manzanaPosService.getCheque(request)) as ManzanaCheque
        const storeLookup = await this.stores.getInn(request.storeId)
        if (!storeLookup) {
            throw new NotFoundError('store with this id not found')
        }
        const order = await this.ordersRepository.insert(createEcomOrder(request, cheque, storeLookup.INN))

        switch (order.payType) {
            case PayType.CASH:
                return this.ecom.postOrder(order)
            case PayType.ONLINE:
                const sbolResponse = await this.sbolService.registerPreAuth({
                    orderNumber: order.extId,
                    failUrl: this.getRedirectUrl(order.extId, false),
                    returnUrl: this.getRedirectUrl(order.extId, true),
                    description: `Авторизация заказа из мобильного приложения`,
                    amount: cheque.amount,
                    clientId: request.clientTel,
                    INN: order.INN,
                    pageView: 'MOBILE'
                })
                return ctx.redirect(sbolResponse.formUrl)
            default:
                throw new BadRequestError(`payType ${order.payType} not supported`)
        }
    }

    @Get('/fiscal/callback')
    public async processSbolCallback(@QueryParam(PARAM_ORDER_ID, { required: true }) orderId: string) {
        const order = await this.ordersRepository.findById(orderId)
        if (!order) {
            throw new NotFoundError('no authorized payment with this id')
        }
        const status = await this.sbolService.getOrderStatus({
            orderNumber: orderId,
            INN: order.INN
        })
        if (status.orderStatus === StatusCode.PREAUTHORIZED) {
            // successfully pre-authorized - send to ecom
            return this.ecom.postOrder(order)
        } else {
            const err = new HttpError(402, status.actionCodeDescription)
            throw Object.assign(err, status) // send status to user
        }
    }

    private getRedirectUrl(orderNumber: string, success: boolean) {
        const params: any = {}
        params[PARAM_ORDER_ID] = orderNumber
        params[PARAM_SBOL_REDIRECT_RESULT] = success
        return `xcom://gateway.result?${stringify(params)}`
    }
}
