import * as requestPromise from 'request-promise-native'
import { HttpError, NotFoundError } from 'routing-controllers'
import { Inject, Service } from 'typedi'
import { SBOL_GATEWAY_URL } from '../config/env.config'
import { INN } from '../mongo/repository/stores'
import { AccountManager } from './accountManager'
import { OrderStatusRequest } from './orderStatusRequest'
import { OrderStatusResponse } from './orderStatusResponse'
import { PreAuthRequest } from './preAuthRequest'
import { PreAuthResponse } from './preAuthResponse'
import { RefundRequest } from './refundRequest'
import { ReverseRequest } from './reverseRequest'
import { SbolResponse } from './sbolResponse'

@Service()
export class SbolService {
    @Inject()
    private readonly accountManager!: AccountManager

    public async registerPreAuth(params: PreAuthRequest & INN): Promise<PreAuthResponse> {
        return this.request('rest/registerPreAuth.do', params)
    }

    public async getOrderStatus(params: OrderStatusRequest & INN): Promise<OrderStatusResponse> {
        return this.request('rest/getOrderStatusExtended.do', params)
    }

    public async reverseOrder(params: ReverseRequest & INN): Promise<SbolResponse> {
        return this.request('rest/reverse.do', params)
    }

    public async refundOrder(params: RefundRequest & INN): Promise<SbolResponse> {
        return this.request('rest/refund.do', params)
    }

    private async request(method: string, params: INN) {
        const credentials = this.accountManager.getForInn(params.INN)
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
        if (res.errorCode && res.errorCode !== '0' && res.errorCode !== 0) {
            throw Object.assign(new HttpError(502), res)
        }
        return res
    }
}
