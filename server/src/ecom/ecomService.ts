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
import { OrdersRepository } from '../mongo/repository/orders'
import { SbolResponse } from '../sbol/sbolResponse'
import { SbolService } from '../sbol/sbolService'
import { ecomOptions } from './ecomOptions'
import { EcomOrderResponse } from './ecomOrderResponse'
import { EcomOrderStatus } from './ecomOrderStatus'
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

    public async submitOrder(order: Order): Promise<EcomOrderResponse> {
        return this.request({
            ...ecomOptions,
            method: 'POST',
            uri: `${ECOM_URL}/orders`,
            body: order
        })
    }

    public async submitOrderStatus(order: Order, statusId: number): Promise<EcomOrderStatusResponse> {
        return this.request({
            ...ecomOptions,
            method: 'PUT',
            uri: `${ECOM_URL}/orders/${order.extId}`,
            body: {
                statusId
            }
        })
    }

    public async getOrderById(orderId: number): Promise<Order> {
        const response: Order = (await this.request({
            ...ecomOptions,
            method: 'GET',
            uri: `${ECOM_URL}/orders/${orderId}`
        }))[0]
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
