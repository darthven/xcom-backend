import { Body, JsonController, MethodNotAllowedError, Param, Post } from 'routing-controllers'
import { Inject } from 'typedi'
import { ChequeRequest } from '../common/chequeRequest'

import { Cheque } from '../common/cheque'
import { FiscalChequeRequest } from '../common/fiscalChequeRequest'
import { SoftChequeRequest } from '../common/softChequeRequest'
import { ManzanaCheque } from '../manzana/manzanaCheque'
import { ManzanaPosService } from '../manzana/manzanaPosService'

@JsonController('/cheque')
export class ChequeController {
    @Inject()
    private readonly manzanaPosService!: ManzanaPosService

    @Post('/soft')
    public async handleSoftCheque(
        @Body() request: SoftChequeRequest,
        @Param('type') type: string
    ): Promise<ManzanaCheque> {
        throw this.manzanaPosService.getCheque(request)
    }

    @Post('/fiscal')
    public async postFiscalCheque(@Body() request: FiscalChequeRequest) {
        const cheque = this.manzanaPosService.getCheque(request)
    }
}
