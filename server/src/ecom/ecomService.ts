import { CoreOptions, RequiredUriUrl } from 'request'
import * as requestPromise from 'request-promise-native'
import { Service } from 'typedi'
import { ECOM_URL } from '../config/env.config'
import { ManzanaCheque } from '../manzana/manzanaCheque'
import { Order } from '../mongo/entity/order'
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

    private async request(options: CoreOptions & RequiredUriUrl) {
        return requestPromise(options)
    }
}
