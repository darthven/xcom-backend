import {
    BadRequestError,
    Body,
    Ctx,
    Get,
    HttpError,
    JsonController,
    NotFoundError, Param,
    Post,
    QueryParam
} from 'routing-controllers'
import { Inject } from 'typedi'

import { Context } from 'koa'
import { stringify } from 'querystring'
import { FiscalChequeRequest } from '../common/fiscalChequeRequest'
import { SoftChequeRequest } from '../common/softChequeRequest'
import { createEcomOrder } from '../ecom/ecomOrder'
import { EcomService } from '../ecom/ecomService'
import { PayType } from '../ecom/payType'
import { ManzanaCheque } from '../manzana/manzanaCheque'
import { ManzanaPosService } from '../manzana/manzanaPosService'
import { Order } from '../mongo/entity/order'
import { OrdersRepository } from '../mongo/repository/orders'
import { StoreRepository } from '../mongo/repository/stores'
import { ACCOUNTS } from '../sbol/accounts'
import { StatusCode } from '../sbol/orderStatusResponse'
import { PreAuthResponse } from '../sbol/preAuthResponse'
import { SbolService } from '../sbol/sbolService'
import logger from "../config/logger.config";

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
    public async handleSoftCheque(
        @Body() request: SoftChequeRequest
    ): Promise<ManzanaCheque & { payTypes: PayType[] }> {
        const manzanaCheque = this.manzanaPosService.getCheque(request)
        const inn = await this.stores.getInn(request.storeId)
        if (!inn) {
            throw new BadRequestError(`Store with id ${request.storeId} not found`)
        }
        const payTypes = [PayType.CASH]
        // check if has a gateway account with this INN
        if (inn.INN && ACCOUNTS[inn.INN]) {
            payTypes.push(PayType.ONLINE)
        }
        return {
            ...(await manzanaCheque),
            payTypes
        }
    }

    @Post('/fiscal/:payType')
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
                    pageView: 'MOBILE'
                })
            default:
                throw new BadRequestError(`payType ${order.payType} not supported`)
        }
    }

    @Get('/fiscal/callback')
    public async processSbolCallback(
        @QueryParam(PARAM_ORDER_ID, { required: true }) orderId: string
    ): Promise<Order & { id: number }> {
        const order = await this.ordersRepository.findById(orderId)
        if (!order) {
            throw new NotFoundError('no authorized payment with this id')
        }
        const status = await this.sbolService.getOrderStatus({
            orderNumber: orderId,
            INN: order.INN
        })
        if (status.orderStatus === StatusCode.PREAUTHORIZED) {
            // successfully pre-authorized - post to ecom
            return this.submitToEcomAndSaveOrder(order)
        } else {
            const err = new HttpError(402, status.actionCodeDescription)
            throw Object.assign(err, status) // send status to user
        }
    }

    private async submitToEcomAndSaveOrder(order: Order): Promise<Order & { id: number }> {
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
        return `xcom://gateway.result?${stringify(params)}`
    }
}
