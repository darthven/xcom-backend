import { Get, JsonController, NotFoundError, Param, State, UseBefore } from 'routing-controllers'
import { Inject } from 'typedi'

import { IdsInjectMiddleware } from '../middlewares/ids.inject.middleware'
import { ProductFilterInjectMiddleware } from '../middlewares/productFilter.inject.middleware'
import { RegionInjectMiddleware } from '../middlewares/region.inject.middleware'
import { SkipTakeInjectMiddleware } from '../middlewares/skipTake.inject.middleware'
import { GoodsHint } from '../mongo/queries/GoodsHint'
import { GoodsNullQuery } from '../mongo/queries/GoodsNullQuery'
import { GoodsSort } from '../mongo/queries/GoodsSort'
import { GoodsStrictQuery } from '../mongo/queries/GoodsStrictQuery'
import { GoodRepository } from '../mongo/repository/goods'
import { Ids } from '../parameters/ids'
import { ProductFilter } from '../parameters/productFilter'
import { Region } from '../parameters/region'
import { SkipTake } from '../parameters/skipTake'

@JsonController('/goods')
export class GoodsController {
    @Inject()
    private goods!: GoodRepository

    @Get()
    @UseBefore(SkipTakeInjectMiddleware)
    @UseBefore(RegionInjectMiddleware)
    @UseBefore(ProductFilterInjectMiddleware)
    public async getGoods(
        @State('skipTake') skipTake: SkipTake,
        @State('region') region: Region,
        @State('productFilter') filter: ProductFilter
    ) {
        const sort = new GoodsSort(filter.sort, filter.order)
        const hint = new GoodsHint(filter.priceMin, filter.priceMax, filter.query)
        const withoutPriceMatch = new GoodsNullQuery(region.region, filter.query, filter.categories)
        const withPriceMatch = new GoodsStrictQuery(
            region.region,
            filter.query,
            filter.categories,
            filter.priceMin,
            filter.priceMax
        )
        const res = await this.goods.getAll(withPriceMatch, withoutPriceMatch, skipTake, region, sort, hint)
        return {
            length: res.fullLength,
            categories: await this.goods.getCategories(withPriceMatch, hint),
            density: await this.goods.getDensity(withPriceMatch, region, hint),
            price: await this.goods.getMinMaxPrice(withPriceMatch, region, hint),
            data: res.data
        }
    }
    @Get('/get/data')
    @UseBefore(SkipTakeInjectMiddleware)
    @UseBefore(RegionInjectMiddleware)
    @UseBefore(ProductFilterInjectMiddleware)
    public async getGoodsData(
        @State('skipTake') skipTake: SkipTake,
        @State('region') region: Region,
        @State('productFilter') filter: ProductFilter
    ) {
        const sort = new GoodsSort(filter.sort, filter.order)
        const hint = new GoodsHint(filter.priceMin, filter.priceMax, filter.query)
        const withoutPriceMatch = new GoodsNullQuery(region.region, filter.query, filter.categories)
        const withPriceMatch = new GoodsStrictQuery(
            region.region,
            filter.query,
            filter.categories,
            filter.priceMin,
            filter.priceMax
        )
        const res = await this.goods.getAll(withPriceMatch, withoutPriceMatch, skipTake, region, sort, hint)
        return {
            length: res.fullLength,
            data: res.data
        }
    }
    @Get('/get/info')
    @UseBefore(SkipTakeInjectMiddleware)
    @UseBefore(RegionInjectMiddleware)
    @UseBefore(ProductFilterInjectMiddleware)
    public async getGoodsInfo(
        @State('skipTake') skipTake: SkipTake,
        @State('region') region: Region,
        @State('productFilter') filter: ProductFilter
    ) {
        const hint = new GoodsHint(filter.priceMin, filter.priceMax, filter.query)
        const withPriceMatch = new GoodsStrictQuery(
            region.region,
            filter.query,
            filter.categories,
            filter.priceMin,
            filter.priceMax
        )
        return {
            length: await this.goods.getLength(withPriceMatch, hint),
            categories: await this.goods.getCategories(withPriceMatch, hint),
            density: await this.goods.getDensity(withPriceMatch, region, hint),
            price: await this.goods.getMinMaxPrice(withPriceMatch, region, hint)
        }
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
    @Get('/by/ids')
    @UseBefore(IdsInjectMiddleware)
    @UseBefore(RegionInjectMiddleware)
    public async getGoodsByIds(@State('ids') ids: Ids, @State('region') region: Region) {
        return this.goods.getByIds(ids.value, region)
    }
}
