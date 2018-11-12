import { MethodNotAllowedError } from 'routing-controllers'
import { Inject, Service } from 'typedi'
import { SoftChequeRequest } from '../common/softChequeRequest'
import { MANZANA_CASH_URL } from '../config/env.config'
import SoapUtil from '../utils/soapUtil'
import { ManzanaCheque } from './manzanaCheque'

@Service()
export class ManzanaPosService {
    @Inject()
    private soapUtil!: SoapUtil

    public async getCheque(chequeRequest: SoftChequeRequest): Promise<ManzanaCheque> {
        return this.soapUtil.sendRequestFromXml(
            MANZANA_CASH_URL,
            await this.soapUtil.createSoftChequeRequest(chequeRequest),
            {
                'Content-Type': 'text/xml;charset=UTF-8'
            }
        )
    }
}
