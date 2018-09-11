import { Get, JsonController, State, UseBefore } from 'routing-controllers'
import { Inject } from 'typedi'

import { LocationFilterInjectMiddleware } from '../middlewares/locationFilter.inject.middleware'
import { LocationsQuery } from '../mongo/queries/LocationsQuery'
import { StoreRepository } from '../mongo/repository/stores'
import { LocationFilter } from '../parameters/locationFilter'

@JsonController('/locations')
export class LocationsController {
    @Inject()
    private stores!: StoreRepository

    @Get()
    @UseBefore(LocationFilterInjectMiddleware)
    public async getLocations(@State('locationFilter') filter: LocationFilter) {
        const query = new LocationsQuery(filter)
        return this.stores.getLocations(query)
    }
    @Get('/types')
    public async getLocationsTypes() {
        return this.stores.getLocationsType()
    }
}
