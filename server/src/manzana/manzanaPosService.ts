import { MethodNotAllowedError } from 'routing-controllers'
import { Inject, Service } from 'typedi'
import * as converter from 'xml-js'
import { Cheque } from '../common/cheque'
import { SoftChequeRequest } from '../common/softChequeRequest'
import { MANZANA_CASH_URL } from '../config/env.config'
import { ChequeResponseModel } from '../utils/soapDefinitions'
import SoapUtil from '../utils/soapUtil'
import { ManzanaCheque } from './manzanaCheque'

@Service()
export class ManzanaPosService {
    @Inject()
    private soapUtil!: SoapUtil

    public async getCheque(chequeRequest: SoftChequeRequest): Promise<ChequeResponseModel> {
        return this.soapUtil.sendRequestFromXml(
            MANZANA_CASH_URL,
            this.soapUtil.createSoftChequeRequest(chequeRequest),
            {
                'Content-Type': 'text/xml;charset=UTF-8'
            }
        )
    }
}
