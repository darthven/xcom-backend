import { BadRequestError, Body, JsonController, Post } from 'routing-controllers'
import { Inject } from 'typedi'

import { SoftChequeRequest } from '../common/softChequeRequest'
import { PayType } from '../ecom/payType'
import { ManzanaCheque } from '../manzana/manzanaCheque'
import { ManzanaPosService } from '../manzana/manzanaPosService'
import { INN, StoreRepository } from '../mongo/repository/stores'
import { AccountManager } from '../sbol/accountManager'

@JsonController('/cheque')
export class ChequeController {
    @Inject()
    private readonly manzanaPosService!: ManzanaPosService
    @Inject()
    private readonly stores!: StoreRepository
    @Inject()
    private readonly accountManager!: AccountManager

    @Post('/soft')
    public async handleSoftCheque(
        @Body() request: SoftChequeRequest
    ): Promise<ManzanaCheque & { payTypes: PayType[] }> {
        const inn: INN | null = await this.stores.getInn(request.storeId)
        if (!inn) {
            throw new BadRequestError(`Store with id ${request.storeId} not found`)
        }
        const manzanaCheque: ManzanaCheque = await this.manzanaPosService.getCheque(request)
        const payTypes: PayType[] = [PayType.CASH]
        // check if has a gateway account with this INN
        if (inn.INN && this.accountManager.getForInn(inn.INN)) {
            payTypes.push(PayType.ONLINE)
        }
        return {
            ...manzanaCheque,
            payTypes
        }
    }
}
