import { CoreOptions, RequiredUriUrl } from 'request'
import * as requestPromise from 'request-promise-native'
import { Service } from 'typedi'

import { PriceError } from '../common/errors'
import { ECOM_URL } from '../config/env.config'
import { Order } from '../mongo/entity/order'
import { ecomOptions } from './ecomOptions'
import { EcomOrderResponse } from './ecomOrderResponse'

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
            throw res
        }
        return res
    }

    private checkPrices(goodsIdsFromRequest: number[], goodsIdsFromResponse: number[]): number[] {
        return goodsIdsFromRequest.filter(item => goodsIdsFromResponse.indexOf(item) === -1)
    }
}
