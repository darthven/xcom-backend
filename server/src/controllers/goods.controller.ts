import { Get, JsonController, NotFoundError, Param, QueryParam, State, UseBefore } from 'routing-controllers'
import { Inject } from 'typedi'

import { IdsInjectMiddleware } from '../middlewares/ids.inject.middleware'
import { ProductFilterInjectMiddleware } from '../middlewares/productFilter.inject.middleware'
import { RegionInjectMiddleware } from '../middlewares/region.inject.middleware'
import { SkipTakeInjectMiddleware } from '../middlewares/skipTake.inject.middleware'
import { GoodsFilter } from '../mongo/queries/GoodsFilter'
import { GoodsHint } from '../mongo/queries/GoodsHint'
import { GoodsSort } from '../mongo/queries/GoodsSort'
import { GoodsTextQuery } from '../mongo/queries/GoodsTextQuery'
import { GoodRepository } from '../mongo/repository/goods'
import { Ids } from '../parameters/ids'
import { ProductFilter } from '../parameters/productFilter'
import { Region } from '../parameters/region'
import { SkipTake } from '../parameters/skipTake'
import { GeneralController } from './general.controller'

@JsonController('/goods')
export class GoodsController extends GeneralController {
    @Inject()
    private goods!: GoodRepository

    @Get('/get/all')
    public async getAllGoods() {
        return this.goods.collection
            .aggregate([
                {
                    $project: {
                        _id: 0,
                        id: 1
                    }
                }
            ])
            .toArray()
    }

    @Get()
    @UseBefore(SkipTakeInjectMiddleware)
    @UseBefore(RegionInjectMiddleware)
    @UseBefore(ProductFilterInjectMiddleware)
    public async getGoods(
        @State('skipTake') skipTake: SkipTake,
        @State('region') region: Region,
        @State('productFilter') filter: ProductFilter
    ) {
        const sort = new GoodsSort(filter.sort, filter.order, filter.query)
        const hint = new GoodsHint(filter.priceMin, filter.priceMax, filter.query)
        const textQuery = new GoodsTextQuery(filter.query)
        const filterQuery = new GoodsFilter(region.region, filter)
        const all = this.goods.getAll(filterQuery, textQuery, skipTake, region, sort, hint, filter.storeIds)
        const categories = this.goods.getCategories(filterQuery, textQuery, hint)
        const price = await this.goods.getMinMaxPrice(filterQuery, textQuery, region, hint)
        const density = this.goods.getDensity(filterQuery, textQuery, region, hint, price.max)
        const res = await all
        return {
            length: res.fullLength,
            categories: await categories,
            density: await density,
            price,
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
        const sort = new GoodsSort(filter.sort, filter.order, filter.query)
        const hint = new GoodsHint(filter.priceMin, filter.priceMax, filter.query)
        const textQuery = new GoodsTextQuery(filter.query)
        const filterQuery = new GoodsFilter(region.region, filter)
        const res = await this.goods.getAll(filterQuery, textQuery, skipTake, region, sort, hint, filter.storeIds)
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
        const filterQuery = new GoodsFilter(region.region, filter)
        const textQuery = new GoodsTextQuery(filter.query)
        const length = this.goods.getLength(filterQuery, textQuery, hint)
        const categories = this.goods.getCategories(filterQuery, textQuery, hint)
        const price = await this.goods.getMinMaxPrice(filterQuery, textQuery, region, hint)
        const density = this.goods.getDensity(filterQuery, textQuery, region, hint, price.max)
        return {
            length: await length,
            categories: await categories,
            density: await density,
            price
        }
    }
    @Get('/get/barcode/:barcode')
    @UseBefore(RegionInjectMiddleware)
    public async getGoodsByBarcode(
        @Param('barcode') id: string,
        @State('region') region: Region,
        @QueryParam('storeId') storeId?: number | number[]
    ) {
        let storeIds
        if (storeId) {
            storeIds = (Array.isArray(storeId) ? storeId : [storeId]).map(Number)
        }
        return this.goods.getByBarcode(id, region, storeIds)
    }
    @Get('/:id')
    @UseBefore(RegionInjectMiddleware)
    public async getSingle(
        @Param('id') id: number,
        @State('region') region: Region,
        @QueryParam('storeId') storeId?: number | number[]
    ) {
        let storeIds
        if (storeId) {
            storeIds = (Array.isArray(storeId) ? storeId : [storeId]).map(Number)
        }
        const res = await this.goods.getSingle(id, region, storeIds)
        if (!res || !res[0]) {
            throw new NotFoundError(this.localizationManager.getValue('Good not found'))
        }
        return res[0]
    }
    @Get('/by/ids')
    @UseBefore(IdsInjectMiddleware)
    @UseBefore(RegionInjectMiddleware)
    public async getGoodsByIds(
        @State('ids') ids: Ids,
        @State('region') region: Region,
        @QueryParam('storeId') storeId?: number | number[]
    ) {
        let storeIds
        if (storeId) {
            storeIds = (Array.isArray(storeId) ? storeId : [storeId]).map(Number)
        }
        return this.goods.getByIds(ids.value, region, storeIds)
    }
}
