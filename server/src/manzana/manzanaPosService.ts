import { MethodNotAllowedError } from 'routing-controllers'
import { Service } from 'typedi'
import { SoftChequeRequest } from '../common/softChequeRequest'
import { ManzanaCheque } from './manzanaCheque'

@Service()
export class ManzanaPosService {
    public async getCheque(chequeRequest: SoftChequeRequest): Promise<ManzanaCheque> {
        // TODO:
        // return this.soapUtil.sendRequestFromXml(MANZANA_CASH_URL, this.soapUtil.createChequeRequest(request, 'soft'), {
        //     'Content-Type': 'text/xml;charset=UTF-8'
        // })
        throw new MethodNotAllowedError()
    }
}
