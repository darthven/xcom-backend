import {
    BadRequestError,
    Get,
    JsonController,
    NotFoundError,
    Param,
    QueryParam,
    State,
    UseBefore
} from 'routing-controllers'
import { Inject } from 'typedi'
import { PayType } from '../ecom/payType'
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
    public async getLocations(@State('locationFilter') filter: LocationFilter, @QueryParam('goodsId') goodsId: any) {
        if (goodsId) {
            const ids = (Array.isArray(goodsId) ? goodsId : [goodsId]).map(Number)
            return this.stores.getStoresAndStocksForProductList(filter, ids)
        }
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
}
