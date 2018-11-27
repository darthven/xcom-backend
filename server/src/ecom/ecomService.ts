import { stringify } from 'querystring'
import { CoreOptions, RequiredUriUrl } from 'request'
import * as requestPromise from 'request-promise-native'
import { BadRequestError, HttpError, NotFoundError } from 'routing-controllers'
import { Inject, Service } from 'typedi'

import { PriceError } from '../common/errors'
import { ECOM_URL } from '../config/env.config'
import logger from '../config/logger.config'
import { ManzanaUser } from '../manzana/manzanaUser'
import { Order } from '../mongo/entity/order'
import { OrderStatus } from '../mongo/entity/orderStatus'
import { OrdersRepository } from '../mongo/repository/orders'
import { OrderStatusRepository } from '../mongo/repository/orderStatuses'
import { SbolResponse } from '../sbol/sbolResponse'
import { SbolService } from '../sbol/sbolService'
import { ecomOptions } from './ecomOptions'
import { EcomOrderResponse } from './ecomOrderResponse'
import { EcomOrderStatusResponse } from './ecomOrderStatusResponse'
import { OrderStatus as Status } from './orderStatus.enum'
import { PayType } from './payType'

interface PriceDescriptor {
    storeId: number
    goodsId: number
    prepayPercent: number
    price: number
}

@Service()
export class EcomService {
    @Inject()
    private readonly orderRepository!: OrdersRepository

    @Inject()
    private readonly orderStatusRepository!: OrderStatusRepository

    @Inject()
    private readonly sbolService!: SbolService

    public async submitToEcomAndSaveOrder(order: Order): Promise<Order & { id: number }> {
        logger.debug(JSON.stringify(order))
        const res = await this.submitOrder(order)
        await this.orderRepository.updateById(order.extId, { id: res.orderId })
        return {
            ...order,
            id: res.orderId
        }
    }

    public async updateOrderStatus(
        orderId: number,
        user: ManzanaUser,
        { statusId }: { statusId: number }
    ): Promise<EcomOrderStatusResponse | SbolResponse> {
        const order: Order = await this.orderRepository.collection.findOne({ id: orderId })
        await this.checkOrderOwner(order, orderId, user)
        return this.handleOrderStatus(order, statusId)
    }

    public async reverseOrder(order: Order): Promise<EcomOrderStatusResponse> {
        return this.changeOrderStatus(order, Status.REVERSED_BY_CLIENT)
    }

    public async getPrices(goodsIds: number[], storeId: number): Promise<PriceDescriptor[]> {
        const response = await this.request({
            ...ecomOptions,
            method: 'POST',
            uri: `${ECOM_URL}/prices`,
            body: {
                stores: [storeId],
                goods: goodsIds
            }
        })
        const { prices } = response
        const invalidGoodsIds: number[] = this.checkPrices(goodsIds, prices.map((pr: PriceDescriptor) => pr.goodsId))
        if (invalidGoodsIds.length > 0) {
            throw new PriceError(storeId, invalidGoodsIds)
        }
        return prices
    }

    private async checkOrderOwner(order: Order, orderId: number, user: ManzanaUser): Promise<void> {
        if (!order) {
            throw new NotFoundError(`Order with id "${orderId}" was not found`)
        } else if (order.clientTel !== user.MobilePhone) {
            throw new NotFoundError(`Client does not have current order with id "${orderId}"`)
        }
    }

    private async handleOrderStatus(order: Order, statusId: number): Promise<EcomOrderStatusResponse | SbolResponse> {
        switch (statusId) {
            case Status.REVERSED_BY_CLIENT:
                return this.handleOrderReverse(order, statusId)
            default:
                throw new HttpError(407, `Cannot handle order by status "${statusId}"`)
        }
    }

    private async handleOrderReverse(order: Order, statusId: number): Promise<EcomOrderStatusResponse | SbolResponse> {
        await this.checkOrderStatusForReverse(statusId)
        return this.handleOrderSbolForReverse(order, statusId)
    }

    private async checkOrderStatusForReverse(statusId: number): Promise<void> {
        const orderStatus: OrderStatus = await this.orderStatusRepository.collection.findOne({ id: statusId })
        if (!orderStatus) {
            throw new NotFoundError(`Order status with id "${statusId}" was not found`)
        } else if (![Status.SALED, Status['Отказ по дефектуре']].includes(orderStatus.id)) {
            throw new HttpError(406, `Cannot process order with statuses "Продан" and "На дефектуре"`)
        }
    }

    private async handleOrderSbolForReverse(
        order: Order,
        statusId: number
    ): Promise<EcomOrderStatusResponse | SbolResponse> {
        switch (order.payType) {
            case PayType.CASH:
                return this.changeOrderStatus(order, statusId)
            case PayType.ONLINE:
                const response = await this.sbolService.reverseOrder({
                    orderId: order.id!.toString(),
                    INN: order.INN
                })
                return response
            default:
                throw new BadRequestError(`payType ${order.payType} not supported`)
        }
    }

    private async submitOrder(order: Order): Promise<EcomOrderResponse> {
        return this.request({
            ...ecomOptions,
            method: 'POST',
            uri: `${ECOM_URL}/orders`,
            body: order
        })
    }

    private async changeOrderStatus(order: Order, statusId: number): Promise<EcomOrderStatusResponse> {
        const response: EcomOrderStatusResponse = await this.request({
            ...ecomOptions,
            method: 'PUT',
            uri: `${ECOM_URL}/orders/${order.extId}`,
            body: {
                statusId
            }
        })
        if (!response.errorCode || response.errorCode === 0) {
            await this.orderRepository.updateById(order.extId, { statusId })
        }
        return response
    }

    private async request(options: CoreOptions & RequiredUriUrl) {
        const res: any = await requestPromise(options)
        if (res.errorCode) {
            throw Object.assign(new HttpError(502), res)
        }
        return res
    }

    private checkPrices(goodsIdsFromRequest: number[], goodsIdsFromResponse: number[]): number[] {
        return goodsIdsFromRequest.filter(item => goodsIdsFromResponse.indexOf(item) === -1)
    }
}
