import { CoreOptions, RequiredUriUrl } from 'request'
import * as requestPromise from 'request-promise-native'
import { BadRequestError, HttpError, NotFoundError } from 'routing-controllers'
import { Inject, Service } from 'typedi'

import { PriceError } from '../common/errors'
import { ECOM_URL } from '../config/env.config'
import { ManzanaUser } from '../manzana/manzanaUser'
import { Order } from '../mongo/entity/order'
import { OrderStatus } from '../mongo/entity/orderStatus'
import { OrdersRepository } from '../mongo/repository/orders'
import { OrderStatusRepository } from '../mongo/repository/orderStatuses'
import { ecomOptions } from './ecomOptions'
import { EcomOrderResponse } from './ecomOrderResponse'
import { EcomOrderStatusResponse } from './ecomOrderStatusResponse'
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

    public async submitOrder(order: Order): Promise<EcomOrderResponse> {
        return this.request({
            ...ecomOptions,
            method: 'POST',
            uri: `${ECOM_URL}/orders`,
            body: order
        })
    }

    public async updateOrderStatus(
        orderId: number,
        user: ManzanaUser,
        { statusId }: { statusId: number }
    ): Promise<EcomOrderStatusResponse> {
        const order: Order = await this.orderRepository.collection.findOne({ id: orderId })
        await this.checkOrderOwner(order, orderId, user)
        await this.checkOrderStatus(statusId)
        return this.handleOrderSBOL(order, statusId)
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
            throw new HttpError(405, `Client does not have current order with id "${orderId}"`)
        }
    }

    private async checkOrderStatus(statusId: number): Promise<void> {
        const orderStatus: OrderStatus = await this.orderStatusRepository.collection.findOne({ id: statusId })
        if (!orderStatus) {
            throw new NotFoundError(`Order status with id "${statusId}" was not found`)
        } else if (![12, 14].includes(orderStatus.id)) {
            // Если продан или на дефектуре
            throw new HttpError(406, `Cannot process order with statuses "Продан" and "На дефектуре"`)
        }
    }

    private async handleOrderSBOL(order: Order, statusId: number): Promise<EcomOrderStatusResponse> {
        switch (order.payType) {
            case PayType.CASH:
                return this.changeOrderStatus(order.id!, statusId)
            case PayType.ONLINE:
            default:
                throw new BadRequestError(`payType ${order.payType} not supported`)
        }
    }

    private async changeOrderStatus(orderId: number, statusId: number): Promise<EcomOrderStatusResponse> {
        const response: EcomOrderStatusResponse = await this.request({
            ...ecomOptions,
            method: 'PUT',
            uri: `${ECOM_URL}/orders/${orderId}`,
            body: {
                statusId
            }
        })
        if (!response.errorCode) {
            await this.orderRepository.collection.updateOne({ id: orderId }, { statusId })
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
