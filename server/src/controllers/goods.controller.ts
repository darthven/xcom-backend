import { Get, JsonController, Param, State, UseBefore } from 'routing-controllers'
import { Inject } from 'typedi'

import { ProductFilterInjectMiddleware } from '../middlewares/productFilter.inject.middleware'
import { RegionInjectMiddleware } from '../middlewares/region.inject.middleware'
import { SkipTakeInjectMiddleware } from '../middlewares/skipTake.inject.middleware'
import { GoodRepository } from '../mongo/repository/goods'
import { StockRepository } from '../mongo/repository/stocks'
import { ProductFilter } from '../parameters/productFilter'
import { Region } from '../parameters/region'
import { SkipTake } from '../parameters/skipTake'

@JsonController('/goods')
export class AuthController {
    @Inject()
    private goods!: GoodRepository
    @Inject()
    private stocks!: StockRepository

    @Get()
    @UseBefore(SkipTakeInjectMiddleware)
    @UseBefore(RegionInjectMiddleware)
    @UseBefore(ProductFilterInjectMiddleware)
    public async getGoods(
        @State('skipTake') skipTake: SkipTake,
        @State('region') region: Region,
        @State('productFilter') filter: ProductFilter
    ) {
        const match: any = {}
        if (filter.query) {
            match.$text = { $search: filter.query }
        }
        if (filter.categories) {
            match.siteCatId = { $in: filter.categories }
        }
        if (filter.priceMin || filter.priceMax) {
            const storePrice =
                filter.priceMin && filter.priceMax
                    ? { $gt: filter.priceMin, $lt: filter.priceMax }
                    : filter.priceMin
                        ? { $gt: filter.priceMin }
                        : { $lt: filter.priceMax }
            match.id = {
                $in: await this.stocks.collection.distinct('goodsId', { storePrice, region: region.region })
            }
        }
        return {
            length: await this.goods.collection.find(match).count(),
            categories: await this.goods.collection.distinct('siteCatId', match),
            density: await this.goods.getDensity(match, region),
            data: await this.goods.getAll(match, skipTake, region)
        }
    }

    @Get('/:id')
    @UseBefore(RegionInjectMiddleware)
    public async getSingle(@Param('id') id: number, @State('region') region: Region) {
        return this.goods.getSingle(id, region)
    }
}
