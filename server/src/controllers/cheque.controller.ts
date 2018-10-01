import { Body, HttpCode, JsonController, Post } from 'routing-controllers'
import { FiscalChequeRequest, SoftChequeRequest } from '../common'
import { MANZANA_CASH_URL } from '../config/env.config'
import SoapUtil from '../utils/soapUtil'

@JsonController('/cheque')
export class ChequeController {
    @HttpCode(200)
    @Post('/soft')
    public async handleSoftCheque(@Body() request: SoftChequeRequest) {
        return SoapUtil.sendRequestFromXml(MANZANA_CASH_URL, SoapUtil.createXmlSoftChequeRequest(request), {
            'Content-Type': 'text/xml;charset=UTF-8'
        })
    }

    @HttpCode(200)
    @Post('/fiscal')
    public async handleFiscalCheque(@Body() request: FiscalChequeRequest) {
        return SoapUtil.sendRequestFromXml(MANZANA_CASH_URL, SoapUtil.createXmlFiscalChequeRequest(request), {
            'Content-Type': 'text/xml;charset=UTF-8'
        })
    }
}
