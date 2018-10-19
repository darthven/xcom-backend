import { Get, JsonController, NotFoundError, Param, State, UseBefore } from 'routing-controllers'
import { Inject } from 'typedi'

import { LocationFilterInjectMiddleware } from '../middlewares/locationFilter.inject.middleware'
import { LocationsQuery } from '../mongo/queries/LocationsQuery'
import { StoreRepository } from '../mongo/repository/stores'
import { LocationFilter } from '../parameters/locationFilter'

@JsonController('/stores')
export class StoresController {
    @Inject()
    private stores!: StoreRepository

    @Get()
    @UseBefore(LocationFilterInjectMiddleware)
    public async getLocations(@State('locationFilter') filter: LocationFilter) {
        const query = new LocationsQuery(filter)
        return this.stores.getAll(query)
    }
    @Get('/:id')
    public async getLocationById(@Param('id') id: number) {
        const res = await this.stores.getSingle(id)
        if (!res || !res[0]) {
            throw new NotFoundError('store not found')
        }
        return res[0]
    }
    @Get('/ree/ree')
    public async getRee() {
        return this.stores.getRee()
    }
}
