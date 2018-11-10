import { MethodNotAllowedError } from 'routing-controllers'
import { Service } from 'typedi'
import { ManzanaCheque } from '../manzana/manzanaCheque'
import { Order } from '../mongo/entity/order'

@Service()
export class EcomService {
    public async postOrder(order: Order): Promise<ManzanaCheque> {
        // TODO:
        // return this.soapUtil.sendRequestFromXml(MANZANA_CASH_URL, this.soapUtil.createChequeRequest(request, 'soft'), {
        //     'Content-Type': 'text/xml;charset=UTF-8'
        // })
        throw new MethodNotAllowedError()
    }
}
