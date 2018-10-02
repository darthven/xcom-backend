import { Get, JsonController, NotFoundError, Param, State, UseBefore } from 'routing-controllers'
import { Inject } from 'typedi'

import { IdsInjectMiddleware } from '../middlewares/ids.inject.middleware'
import { ProductFilterInjectMiddleware } from '../middlewares/productFilter.inject.middleware'
import { QueryTypeInjectMiddleware } from '../middlewares/queryType.inject.middleware'
import { RegionInjectMiddleware } from '../middlewares/region.inject.middleware'
import { SkipTakeInjectMiddleware } from '../middlewares/skipTake.inject.middleware'
import { GoodsHint } from '../mongo/queries/GoodsHint'
import { GoodsNullQuery } from '../mongo/queries/GoodsNullQuery'
import { GoodsSort } from '../mongo/queries/GoodsSort'
import { GoodsStrictQuery } from '../mongo/queries/GoodsStrictQuery'
import { GoodRepository } from '../mongo/repository/goods'
import { Ids } from '../parameters/ids'
import { ProductFilter } from '../parameters/productFilter'
import { QueryType } from '../parameters/queryType'
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
    @UseBefore(QueryTypeInjectMiddleware)
    public async getGoods(
        @State('skipTake') skipTake: SkipTake,
        @State('region') region: Region,
        @State('queryType') type: QueryType,
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
        if (type.type === 'info') {
            return {
                length: await this.goods.getLength(withPriceMatch, hint),
                categories: await this.goods.getCategories(withPriceMatch, hint),
                density: await this.goods.getDensity(withPriceMatch, region, hint)
            }
        }
        const res = await this.goods.getAll(withPriceMatch, withoutPriceMatch, skipTake, region, sort, hint)
        if (type.type === 'data') {
            return {
                length: res.fullLength,
                data: res.data
            }
        }
        return {
            length: res.fullLength,
            categories: await this.goods.getCategories(withPriceMatch, hint),
            density: await this.goods.getDensity(withPriceMatch, region, hint),
            data: res.data
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

/*
Смешной трешак - вот как можно коротко описать этот фильм. Причем смешной не столько фильм сколько абсурд происходящего в нем.
В целом, фильм не заслуживает внимания. Актеры второсортные от начала и до конца, логики повествования нету никакой. А экшн далеко не самый впечатляющий.
Единственное что нормальное есть в этом фильме, это местами достойный черный юмор, тотальная расчлененка человеческого рода и долька атмосферы, которую дарит хищник!
Можно было бы даже отключить мозг, закрыть глаза на многие несостыковки и прочее, но количество
#IMAX
#ThePredator
#170918
#ШейнБлэк
*/
