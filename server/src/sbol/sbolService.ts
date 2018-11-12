import { MethodNotAllowedError } from 'routing-controllers'
import { Service } from 'typedi'
import { AuthorizedRequest } from './authorizedRequest'
import { OrderStatus } from './orderStatus'
import { OrderStatusRequest } from './orderStatusRequest'
import { PreAuthRequest } from './preAuthRequest'
import { PreAuthResponse } from './preAuthResponse'

@Service()
export class SbolService {
    public async registerPreAuth(params: PreAuthRequest): Promise<PreAuthResponse> {
        throw new MethodNotAllowedError()
    }

    public async getOrderStatus(params: OrderStatusRequest): Promise<OrderStatus> {
        throw new MethodNotAllowedError()
    }
}
