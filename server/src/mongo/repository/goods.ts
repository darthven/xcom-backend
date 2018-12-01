import { Inject, Service } from 'typedi'

import {
    IMAGE_DEFAULT_TYPE,
    IMAGE_GOOD_FOLDER,
    IMAGE_M_SUBFOLDER,
    IMAGE_S_SUBFOLDER,
    IMAGE_URL
} from '../../config/env.config'
import { Region } from '../../parameters/region'
import { SkipTake } from '../../parameters/skipTake'
import { Good } from '../entity/good'
import { Share } from '../entity/share'
import { GoodsHint } from '../queries/GoodsHint'
import { GoodsNullQuery } from '../queries/GoodsNullQuery'
import { GoodsQuery } from '../queries/GoodsQuery'
import { GoodsSort } from '../queries/GoodsSort'
import { Repository } from './repository'
import { StocksRepository } from './stocks'

@Service()
export class GoodRepository extends Repository {
    @Inject()
    private readonly stocks!: StocksRepository

    private firstProject = {
        _id: 0,
        id: 1,
        name: 1,
        manufacturer: 1,
        siteCatId: 1,
        country: 1,
        byPrescription: 1,
        mnn: 1,
        price: 1,
        img: 1,
        share: {
            $cond: {
                if: { $lt: ['$share.endDate', new Date()] },
                then: '$$REMOVE',
                else: '$share'
            }
        }
    }
    private secondProject = {
        id: 1,
        name: 1,
        manufacturer: { $ifNull: ['$manufacturer', ''] },
        country: 1,
        activeSubstance: '$mnn',
        categoryId: '$siteCatId',
        byPrescription: { $ifNull: ['$byPrescription', false] },
        inStock: { $ifNull: ['$price.available', 0] },
        price: {
            min: { $ifNull: ['$price.priceMin', null] },
            max: { $ifNull: ['$price.priceMax', null] }
        },
        icon: {
            url: { $concat: [IMAGE_URL, IMAGE_GOOD_FOLDER, '$img'] },
            urls: { $concat: [IMAGE_URL, IMAGE_GOOD_FOLDER, IMAGE_S_SUBFOLDER, '$img'] },
            urlm: { $concat: [IMAGE_URL, IMAGE_GOOD_FOLDER, IMAGE_M_SUBFOLDER, '$img'] }
        },
        'share.id': 1,
        'share.discountValue': 1,
        'share.packCount': 1,
        'share.attributeZOZ': 1,
        'share.startDate': 1,
        'share.endDate': 1,
        'share.description': 1
    }

    private lookup = {
        from: 'shares',
        let: { id: '$id' },
        pipeline: [
            { $match: { $expr: { $eq: ['$goodId', '$$id'] } } },
            {
                $project: {
                    _id: 0,
                    id: 1,
                    description: 1,
                    discountValue: 1,
                    packCount: 1,
                    attributeZOZ: 1,
                    startDate: 1,
                    endDate: 1,
                    regions: 1
                }
            }
        ],
        as: 'shares'
    }

    constructor() {
        super('goods')
    }

    public async createCollection() {
        await super.createCollection()
        await this.collection.createIndex({ name: 'text', tradeName: 'text', suffixes: 'text' })
        await this.collection.createIndex({ id: 1 }, { unique: true })
        await this.collection.createIndex({ siteCatId: 1 })
        await this.collection.createIndex({ price: 1 }, { name: 'price' })
        await this.collection.createIndex({ img: 1 }, { name: 'img' })
        await this.collection.createIndex({ 'price.region': 1 }, { name: 'priceReg' })
        await this.collection.createIndex({ 'price.priceMin': 1 }, { name: 'priceMin' })
        await this.collection.createIndex({ 'price.priceMax': 1 }, { name: 'priceMax' })
        await this.collection.createIndex({ 'price.region': 1, 'price.priceMin': 1 }, { name: 'priceMinReg' })
        await this.collection.createIndex({ 'price.region': 1, 'price.priceMax': 1 }, { name: 'priceMaxReg' })
        await this.collection.createIndex(
            { 'price.region': 1, 'price.priceMin': 1, 'price.priceMax': -1 },
            { name: 'priceMinMaxReg' }
        )
    }

    public async updateImageLink(id: number) {
        return this.collection.updateOne({ id }, { $set: { img: `${id}${IMAGE_DEFAULT_TYPE}` } })
    }

    /**
     * Обьясняю. Во первых, я не нашел возможности в монго возвращать сначала данные с каким-то полем а потом без этого поля, и при этом не сортировать по этому полю.
     * В данном случае, у нас у товара есть цена, есть товары с ценой, а есть без (которых нет в наличии). Можно их отсортировать в порядке понижения цены, тогда в начале будут все товары с ценой, а потом без, но при этом товары ещё будут отсортированы по цене, чего нам не надо.
     * Ситуацию ещё и усложняет то, что есть другие сортировки, которые поломают.
     * Тут нужно понять, что главная цель этого когда, в том что товары должны в первую очередь выдаваться те которые в наличии, т.е. с ценой. Нам не важно какие пришли условия поиска, какая сортировка и прочее, сначала всегда данные с ценой.
     * Более детально по коду, есть 2 почти одинаковые функции обе ищут по товарам, принимают одно и тоже, только одна ищет по товарам с ценой, другая по товарам без цены. Данные с этих функций не могут пересекаться.
     * Фишка с оффсетом в чем.
     * Функция getLength вернёт длину всех товаров с ценой по данному запросу, представим мы вбили какие-то параметры поиска и таких товаров (с ценой) нашло 17 штук (length). В рамках пагинации, на первой странице, у нас skip = 0, take = 10, в таком случае мы проверяем length - skip = 17, число положительное и больше take (по ИФАМ в коде) значит нам нужно будет вернуть 10 товаров которые в наличии.
     * На второй странице,  skip = 10, take = 10. Length по прежнему, 17. Length - skip = 7.
     * В данном случае, число положительное но меньше take, значит нам нужно вернуть 7 товаров с ценой и 3 товара без цены (если они будут).
     * На третьей странице, skip = 20, take = 10.
     * Length - skip = -7. Число отрицательное, значит нам нужно возвращать 10 товаров без цены. (Если они будут).
     */
    public async getAll(
        match: GoodsQuery,
        withoutPriceMatch: GoodsNullQuery,
        skipTake: SkipTake,
        region: Region,
        sort: GoodsSort,
        hint: GoodsHint,
        storeIds?: number[]
    ) {
        let data: any[]
        const fullLength = await this.getLength(match, hint)
        const diff = fullLength - skipTake.skip
        if (diff < 0) {
            // only data without price
            const withoutPriceSkipTake = new SkipTake({ skip: Math.abs(diff), take: skipTake.take })
            data = await this.getAllWithoutPrice(withoutPriceMatch, withoutPriceSkipTake, sort)
        } else if (diff < skipTake.take) {
            // data with and without price
            const withoutPriceSkipTake = new SkipTake({ skip: 0, take: skipTake.take - diff })
            const withoutPriceRes = await this.getAllWithoutPrice(withoutPriceMatch, withoutPriceSkipTake, sort)
            const withPriceRes = await this.getAllWithPrice(match, skipTake, region, sort)
            data = withPriceRes.concat(withoutPriceRes)
        } else {
            // data only with price
            data = await this.getAllWithPrice(match, skipTake, region, sort)
        }
        return {
            fullLength,
            data: storeIds ? await this.joinStocksForStores(data, storeIds) : data
        }
    }

    public async getAllWithPrice(match: GoodsQuery, skipTake: SkipTake, region: Region, sort: GoodsSort) {
        let pipeline = [
            { $match: match },
            sort,
            { $skip: skipTake.skip },
            { $limit: skipTake.take },
            { $project: this.firstProject },
            { $unwind: '$price' },
            { $match: { 'price.region': region.region } },
            { $project: this.secondProject }
        ]
        if (sort.$sort.price) {
            pipeline = [
                { $match: match },
                { $project: this.firstProject },
                { $unwind: '$price' },
                { $match: { 'price.region': region.region } },
                sort,
                { $skip: skipTake.skip },
                { $limit: skipTake.take },
                { $project: this.secondProject }
            ]
        }
        return this.collection.aggregate(pipeline, { allowDiskUse: true }).toArray()
    }

    public async getAllWithoutPrice(match: GoodsNullQuery, skipTake: SkipTake, sort: GoodsSort) {
        return this.collection
            .aggregate(
                [
                    { $match: match },
                    sort,
                    { $skip: skipTake.skip },
                    { $limit: skipTake.take },
                    { $project: this.firstProject },
                    { $project: this.secondProject }
                ],
                { allowDiskUse: true }
            )
            .toArray()
    }

    public async getByIds(ids: number[], region: Region, storeIds?: number[]) {
        const goods = await this.collection
            .aggregate([
                { $match: { id: { $in: ids } } },
                { $project: this.firstProject },
                {
                    $unwind: {
                        path: '$price',
                        preserveNullAndEmptyArrays: true
                    }
                },
                { $match: { $or: [{ price: null }, { 'price.region': region.region }] } },
                { $project: this.secondProject }
            ])
            .toArray()
        return storeIds ? this.joinStocksForStores(goods, storeIds) : goods
    }

    public async getSingle(id: number, region: Region, storeIds?: number[]) {
        const goods = await this.collection
            .aggregate([
                { $match: { id } },
                { $project: this.firstProject },
                {
                    $unwind: {
                        path: '$price',
                        preserveNullAndEmptyArrays: true
                    }
                },
                { $match: { $or: [{ price: null }, { 'price.region': region.region }] } },
                { $project: this.secondProject }
            ])
            .toArray()
        return storeIds ? this.joinStocksForStores(goods, storeIds) : goods
    }

    public async getLength(match: GoodsQuery, hint: GoodsHint) {
        if (hint.hint) {
            return this.collection
                .find(match)
                .hint(hint.hint)
                .count()
        }
        return this.collection.find(match).count()
    }

    public async getByBarcode(barcode: string, region: Region, storeIds?: number[]) {
        const goods = await this.collection
            .aggregate([
                {
                    $match: {
                        barcode: { $regex: `.*${barcode}.*` }
                    }
                },
                { $project: this.firstProject },
                {
                    $unwind: {
                        path: '$price',
                        preserveNullAndEmptyArrays: true
                    }
                },
                { $match: { $or: [{ price: null }, { 'price.region': region.region }] } },
                { $project: this.secondProject }
            ])
            .toArray()
        return storeIds ? this.joinStocksForStores(goods, storeIds) : goods
    }

    public async getCategories(match: GoodsQuery, hint: GoodsHint) {
        const res = await this.collection
            .aggregate([
                { $match: match },
                { $limit: 1000 },
                {
                    $group: {
                        _id: '$siteCatId'
                    }
                },
                {
                    $group: {
                        _id: {},
                        categories: { $push: '$_id' }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        categories: 1
                    }
                }
            ])
            .toArray()
        return res[0] ? res[0].categories : res
    }

    public async getMinMaxPrice(match: GoodsQuery, region: Region, hint: GoodsHint) {
        const res = await this.collection
            .aggregate([
                { $match: match },
                {
                    $project: {
                        _id: 0,
                        id: 1,
                        price: 1
                    }
                },
                { $unwind: '$price' },
                { $match: { 'price.region': region.region } },
                {
                    $group: {
                        _id: null,
                        min: { $min: '$price.priceMin' },
                        max: { $max: '$price.priceMax' }
                    }
                },
                {
                    $project: {
                        min: 1,
                        max: 1,
                        _id: 0
                    }
                }
            ])
            .toArray()
        if (res[0]) {
            return res[0]
        }
        return {
            min: null,
            max: null
        }
    }

    public async getDensity(match: GoodsQuery, region: Region, hint: GoodsHint, max?: number) {
        // generate boundaries
        const min = 300
        if (!max) {
            max = 2500
        }
        const boundaries: number[] = [100, 200]
        for (let i = min; i <= max; i += 100) {
            boundaries.push(i)
        }
        return this.collection
            .aggregate([
                { $match: match },
                {
                    $project: {
                        _id: 0,
                        id: 1,
                        price: 1
                    }
                },
                { $unwind: '$price' },
                { $match: { 'price.region': region.region } },
                { $limit: 1000 },
                {
                    $bucket: {
                        groupBy: '$price.priceMax',
                        boundaries,
                        default: 'Other',
                        output: {
                            count: { $sum: 1 }
                        }
                    }
                },
                {
                    $project: {
                        value: '$_id',
                        count: 1,
                        _id: 0
                    }
                }
            ])
            .toArray()
    }

    public async setShare(share: Share) {
        return this.collection.findOneAndUpdate({ id: share.goodId }, { $set: { share } })
    }

    private joinStocksForStores(goods: Good[], storeIds: number[]): Promise<any[]> {
        return Promise.all(
            goods.map(async (good: any) => {
                return {
                    ...good,
                    stocks: await this.stocks.getForStores(storeIds, [good.id])
                }
            })
        )
    }
}
