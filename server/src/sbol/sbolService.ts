import * as requestPromise from 'request-promise-native'
import { MethodNotAllowedError } from 'routing-controllers'
import { Service } from 'typedi'
import { SBOL_DEFAULT_PASSWORD, SBOL_DEFAULT_USER, SBOL_GATEWAY_URL } from '../config/env.config'
import { INN } from '../mongo/repository/stores'
import { AuthorizedRequest } from './authorizedRequest'
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

    private async request(method: string, params: any) {
        const qs: AuthorizedRequest = {
            ...params,
            userName: SBOL_DEFAULT_USER, // TODO figure out passwords by INN?
            password: SBOL_DEFAULT_PASSWORD
        }
        const options = {
            uri: SBOL_GATEWAY_URL + method,
            qs
        }
        return requestPromise(options)
    }
}
