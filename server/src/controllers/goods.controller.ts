import { Get, JsonController, NotFoundError, Param, State, UseBefore } from 'routing-controllers'
import { Inject } from 'typedi'

import { IdsInjectMiddleware } from '../middlewares/ids.inject.middleware'
import { ProductFilterInjectMiddleware } from '../middlewares/productFilter.inject.middleware'
import { RegionInjectMiddleware } from '../middlewares/region.inject.middleware'
import { SkipTakeInjectMiddleware } from '../middlewares/skipTake.inject.middleware'
import { GoodsHint } from '../mongo/queries/GoodsHint'
import { GoodsQuery } from '../mongo/queries/GoodsQuery'
import { GoodsStrictQuery } from '../mongo/queries/GoodsStrictQuery'
import { GoodRepository } from '../mongo/repository/goods'
import { StockRepository } from '../mongo/repository/stocks'
import { Ids } from '../parameters/ids'
import { ProductFilter } from '../parameters/productFilter'
import { Region } from '../parameters/region'
import { SkipTake } from '../parameters/skipTake'

@JsonController('/goods')
export class GoodsController {
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
        const strict = new GoodsStrictQuery(
            region.region,
            filter.query,
            filter.categories,
            filter.priceMin,
            filter.priceMax
        )
        const match = new GoodsQuery(region.region, filter.query, filter.categories, filter.priceMin, filter.priceMax)
        const hint = new GoodsHint(filter.priceMin, filter.priceMax, filter.query)
        return {
            length: await this.goods.getLength(strict, hint),
            categories: await this.goods.getCategories(strict, hint),
            density: await this.goods.getDensity(strict, region, hint),
            data: await this.goods.getAll(match, skipTake, region)
        }
    }

    @Get('/by/ids')
    @UseBefore(IdsInjectMiddleware)
    @UseBefore(RegionInjectMiddleware)
    public async getGoodsByIds(@State('ids') ids: Ids, @State('region') region: Region) {
        return this.goods.getByIds(ids.value, region)
    }

    @Get('/:id')
    @UseBefore(RegionInjectMiddleware)
    public async getSingle(@Param('id') id: number, @State('region') region: Region) {
        const res = await this.goods.getSingle(id, region)
        if (!res || !res[0]) {
            throw new NotFoundError('good not found')
        }
        return res[0]
    }
}
