import { CoreOptions, RequiredUriUrl } from 'request'
import * as requestPromise from 'request-promise-native'
import { NotFoundError } from 'routing-controllers'
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

    public async getPrice(goodsId: number, storeId: number): Promise<number> {
        const response = await this.request({
            ...ecomOptions,
            method: 'GET',
            uri: `${ECOM_URL}/stocks/${storeId}`
        })
        const stock: Stock = response.stocks.find((it: Stock) => it.goodsId === goodsId)
        if (!stock) {
            throw new NotFoundError(`In stocks of the store "${storeId}" there are no goods with id "${goodsId}"`)
        }
        return stock.ecomPrice
    }

    private async request(options: CoreOptions & RequiredUriUrl) {
        return requestPromise(options)
    }
}
