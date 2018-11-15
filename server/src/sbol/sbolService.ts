import * as requestPromise from 'request-promise-native'
import { NotFoundError } from 'routing-controllers'
import { Service } from 'typedi'
import { SBOL_GATEWAY_URL } from '../config/env.config'
import { INN } from '../mongo/repository/stores'
import { ACCOUNTS } from './accounts'
import { OrderStatusRequest } from './orderStatusRequest'
import { OrderStatusResponse } from './orderStatusResponse'
import { PreAuthRequest } from './preAuthRequest'
import { PreAuthResponse } from './preAuthResponse'

@Service()
export class SbolService {
    public async registerPreAuth(params: PreAuthRequest & INN): Promise<PreAuthResponse> {
        return this.request('rest/registerPreAuth.do', params)
    }

    public async getOrderStatus(params: OrderStatusRequest & INN): Promise<OrderStatusResponse> {
        return this.request('rest/getOrderStatusExtended.do', params)
    }

    private async request(method: string, params: INN) {
        const credentials = ACCOUNTS[params.INN]
        if (!credentials) {
            throw new NotFoundError(`No SBOL account found with this store's INN`)
        }
        const options = {
            uri: SBOL_GATEWAY_URL + method,
            qs: {
                ...params,
                ...credentials
            }
        }
        let res: any = await requestPromise(options)
        try {
            res = JSON.parse(res)
        } catch (e) {
            // not json
        }
        if (res.errorCode) {
            throw res
        }
        return res
    }
}
