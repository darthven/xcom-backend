import { Body, HttpCode, JsonController, Post } from 'routing-controllers'
import { ChequeRequest } from '../common'
import { MANZANA_CASH_URL } from '../config/env.config'
import SoapUtil from '../utils/soapUtil'

@JsonController('/cheque')
export class ChequeController {
    @HttpCode(200)
    @Post('/soft')
    public async handleSoftCheque(@Body() request: ChequeRequest) {
        return SoapUtil.sendRequestFromXml(MANZANA_CASH_URL, SoapUtil.createChequeRequest(request), {
            'Content-Type': 'text/xml;charset=UTF-8'
        })
    }

    @HttpCode(200)
    @Post('/fiscal')
    public async handleFiscalCheque(@Body() request: ChequeRequest) {
        return SoapUtil.sendRequestFromXml(MANZANA_CASH_URL, SoapUtil.createChequeRequest(request), {
            'Content-Type': 'text/xml;charset=UTF-8'
        })
    }
}
