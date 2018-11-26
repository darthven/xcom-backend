import { CoreOptions, RequiredUriUrl } from 'request'
import * as requestPromise from 'request-promise-native'
import { HttpError, NotFoundError } from 'routing-controllers'
import { Inject, Service } from 'typedi'

import { PriceError } from '../common/errors'
import { ECOM_URL } from '../config/env.config'
import { Order } from '../mongo/entity/order'
import { OrderStatus } from '../mongo/entity/orderStatus'
import { OrdersRepository } from '../mongo/repository/orders'
import { OrderStatusRepository } from '../mongo/repository/orderStatuses'
import { ecomOptions } from './ecomOptions'
import { EcomOrderResponse } from './ecomOrderResponse'
import { EcomOrderStatusResponse } from './ecomOrderStatusResponse'

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
        { statusId }: { statusId: number }
    ): Promise<EcomOrderStatusResponse> {
        const order: Order = await this.orderRepository.collection.findOne({ id: orderId })
        if (!order) {
            throw new NotFoundError(`Order with id "${orderId}" was not found`)
        }
        const orderStatus: OrderStatus = await this.orderStatusRepository.collection.findOne({ id: statusId })
        if (!orderStatus) {
            throw new NotFoundError(`Order status with id "${statusId}" was not found`)
        }
        await this.orderRepository.collection.updateOne({ id: orderId }, { statusId })
        return this.request({
            ...ecomOptions,
            method: 'PUT',
            uri: `${ECOM_URL}/orders${orderId}`,
            body: {
                statusId
            }
        })
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
