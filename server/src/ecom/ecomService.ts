import { CoreOptions, RequiredUriUrl } from 'request'
import * as requestPromise from 'request-promise-native'
import { HttpError } from 'routing-controllers'
import { Service } from 'typedi'

import { PriceError } from '../common/errors'
import { ECOM_URL } from '../config/env.config'
import { Order } from '../mongo/entity/order'
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
    public async submitOrder(order: Order): Promise<EcomOrderResponse> {
        return this.request({
            ...ecomOptions,
            method: 'POST',
            uri: `${ECOM_URL}/orders`,
            body: order
        })
    }

    public async updateOrderStatus(order: Order, statusId: number, comment?: string): Promise<EcomOrderStatusResponse> {
        return this.request({
            ...ecomOptions,
            method: 'PUT',
            uri: `${ECOM_URL}/orders/${order.id}`,
            body: {
                statusId,
                comment
            }
        })
    }

    public async getOrderById(orderId: number): Promise<Order> {
        const response: Order = (await this.request({
            ...ecomOptions,
            method: 'GET',
            uri: `${ECOM_URL}/orders/${orderId}`
        })).orders[0]
        return response
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
            throw new PriceError('', storeId, invalidGoodsIds)
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
