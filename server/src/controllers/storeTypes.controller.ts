import { Get, JsonController, QueryParam } from 'routing-controllers'
import { Inject } from 'typedi'

import { StoreTypeRepository } from '../mongo/repository/storeType'

@JsonController('/storeTypes')
export class StoresController {
    @Inject()
    private storeTypes!: StoreTypeRepository

    @Get()
    public async getStoreTypes(@QueryParam('region') region: number) {
        return this.storeTypes.getAll(region)
    }
}
