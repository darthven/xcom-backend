import { Get, JsonController } from 'routing-controllers'
import { Inject } from 'typedi'

import { StoreTypeRepository } from '../mongo/repository/storeType'

@JsonController('/storeTypes')
export class StoresController {
    @Inject()
    private storeTypes!: StoreTypeRepository

    @Get()
    public async getStoreTypes() {
        return this.storeTypes.getAll()
    }
}
