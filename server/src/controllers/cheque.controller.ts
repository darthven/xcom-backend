import { Body, HttpCode, JsonController, Param, Post } from 'routing-controllers'
import { Inject } from 'typedi'
import { ChequeRequest } from '../common'
import { MANZANA_CASH_URL } from '../config/env.config'

import SoapUtil from '../utils/soapUtil'

@JsonController('/cheque')
export class ChequeController {
    @Inject()
    private readonly soapUtil!: SoapUtil

    @HttpCode(200)
    @Post('/:type')
    public async handleSoftCheque(@Body() request: ChequeRequest, @Param('type') type: string) {
        return this.soapUtil.sendRequestFromXml(MANZANA_CASH_URL, this.soapUtil.createChequeRequest(request, type), {
            'Content-Type': 'text/xml;charset=UTF-8'
        })
    }
}
