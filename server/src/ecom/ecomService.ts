import { CoreOptions, RequiredUriUrl } from 'request'
import * as requestPromise from 'request-promise-native'
import { HttpError } from 'routing-controllers'
import { Service } from 'typedi'
import { ECOM_URL } from '../config/env.config'
import { ManzanaCheque } from '../manzana/manzanaCheque'
import { Order } from '../mongo/entity/order'
import { Stock } from '../mongo/entity/stock'
import { ecomOptions } from './ecomOptions'

@Service()
export class EcomService {
    public async postOrder(order: Order): Promise<ManzanaCheque> {
        return this.request({
            ...ecomOptions,
            method: 'POST',
            uri: `${ECOM_URL}/orders`,
            body: order
        })
    }

    public async getPrices(goodsIds: number[], storeId: number): Promise<Array<{ goodsId: number; price: number }>> {
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
        if (!prices) {
            throw new HttpError(400, 'No prices are defined for the current goods')
        }
        return prices
    }

    private async request(options: CoreOptions & RequiredUriUrl) {
        return requestPromise(options)
    }
}
