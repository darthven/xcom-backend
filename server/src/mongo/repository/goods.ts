import { Service } from 'typedi'

import { IMAGE_M_SUBFOLDER, IMAGE_S_SUBFOLDER, IMAGE_STORE_TYPE_FOLDER, IMAGE_URL } from '../../config/env.config'
import { Region } from '../../parameters/region'
import { SkipTake } from '../../parameters/skipTake'
import { GoodsHint } from '../queries/GoodsHint'
import { GoodsQuery } from '../queries/GoodsQuery'
import { GoodsStrictQuery } from '../queries/GoodsStrictQuery'
import { Repository } from './repository'

@Service()
export class GoodRepository extends Repository {
    constructor() {
        super('goods')
    }
    public async createCollection() {
        await super.createCollection()
        await this.collection.createIndex({ name: 'text', tradeName: 'text' })
        await this.collection.createIndex({ id: 1 }, { unique: true })
        await this.collection.createIndex({ siteCatId: 1 })
        await this.collection.createIndex({ price: 1 }, { name: 'price' })
        await this.collection.createIndex({ 'price.region': 1 }, { name: 'priceReg' })
        await this.collection.createIndex({ 'price.priceMin': 1 }, { name: 'priceMin' })
        await this.collection.createIndex({ 'price.priceMax': 1 }, { name: 'priceMax' })
        await this.collection.createIndex({ 'price.region': 1, 'price.priceMin': 1 }, { name: 'priceMinReg' })
        await this.collection.createIndex(
            { 'price.region': 1, 'price.priceMin': 1, 'price.priceMax': -1 },
            { name: 'priceMinMaxReg' }
        )
    }
    public async getAll(match: GoodsQuery, skipTake: SkipTake, region: Region) {
        return this.collection
            .aggregate([
                { $match: match },
                { $skip: skipTake.skip || 0 },
                { $limit: skipTake.take || 10 },
                {
                    $project: {
                        _id: 0,
                        id: 1,
                        name: 1,
                        manufacturer: 1,
                        siteCatId: 1,
                        price: 1,
                        img: 1
                    }
                },
                {
                    $unwind: {
                        path: '$price',
                        preserveNullAndEmptyArrays: true
                    }
                },
                { $match: { $or: [{ price: null }, { 'price.region': region.region }] } },
                {
                    $project: {
                        id: 1,
                        name: 1,
                        manufacturer: 1,
                        categoryId: '$siteCatId',
                        priceMin: '$price.priceMin',
                        priceMax: '$price.priceMax',
                        icon: {
                            url: { $concat: [IMAGE_URL, IMAGE_STORE_TYPE_FOLDER, '$img'] },
                            urls: { $concat: [IMAGE_URL, IMAGE_STORE_TYPE_FOLDER, IMAGE_S_SUBFOLDER, '$img'] },
                            urlm: { $concat: [IMAGE_URL, IMAGE_STORE_TYPE_FOLDER, IMAGE_M_SUBFOLDER, '$img'] }
                        }
                    }
                }
            ])
            .toArray()
    }
    public async getByIds(ids: number[], region: Region) {
        return this.collection
            .aggregate([
                { $match: { id: { $in: ids } } },
                {
                    $project: {
                        _id: 0,
                        id: 1,
                        name: 1,
                        manufacturer: 1,
                        siteCatId: 1,
                        price: 1,
                        img: 1
                    }
                },
                {
                    $unwind: {
                        path: '$price',
                        preserveNullAndEmptyArrays: true
                    }
                },
                { $match: { $or: [{ price: null }, { 'price.region': region.region }] } },
                {
                    $project: {
                        id: 1,
                        name: 1,
                        manufacturer: 1,
                        categoryId: '$siteCatId',
                        priceMin: '$price.priceMin',
                        priceMax: '$price.priceMax',
                        icon: {
                            url: { $concat: [IMAGE_URL, IMAGE_STORE_TYPE_FOLDER, '$img'] },
                            urls: { $concat: [IMAGE_URL, IMAGE_STORE_TYPE_FOLDER, IMAGE_S_SUBFOLDER, '$img'] },
                            urlm: { $concat: [IMAGE_URL, IMAGE_STORE_TYPE_FOLDER, IMAGE_M_SUBFOLDER, '$img'] }
                        }
                    }
                }
            ])
            .toArray()
    }
    public async getSingle(id: number, region: Region) {
        return this.collection
            .aggregate([
                { $match: { id } },
                {
                    $project: {
                        _id: 0,
                        id: 1,
                        name: 1,
                        manufacturer: 1,
                        siteCatId: 1,
                        price: 1,
                        img: 1
                    }
                },
                { $unwind: '$price' },
                { $match: { 'price.region': region.region } },
                {
                    $project: {
                        id: '$_id',
                        _id: 0,
                        name: 1,
                        manufacturer: 1,
                        categoryId: '$siteCatId',
                        priceMin: '$price.priceMin',
                        priceMax: '$price.priceMax',
                        availableCount: '$price.available',
                        icon: {
                            url: { $concat: [IMAGE_URL, IMAGE_STORE_TYPE_FOLDER, '$img'] },
                            urls: { $concat: [IMAGE_URL, IMAGE_STORE_TYPE_FOLDER, IMAGE_S_SUBFOLDER, '$img'] },
                            urlm: { $concat: [IMAGE_URL, IMAGE_STORE_TYPE_FOLDER, IMAGE_M_SUBFOLDER, '$img'] }
                        }
                    }
                }
            ])
            .toArray()
    }
    public async getLength(match: GoodsStrictQuery, hint: GoodsHint) {
        if (hint.hint) {
            return this.collection
                .find(match)
                .hint(hint.hint)
                .count()
        }
        return this.collection.find(match).count()
    }
    public async getCategories(match: GoodsStrictQuery, hint: GoodsHint) {
        const res = await this.collection
            .aggregate(
                [
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
                ],
                hint
            )
            .toArray()
        return res[0] ? res[0].categories : res
    }
    public async getDensity(match: GoodsStrictQuery, region: Region, hint: GoodsHint) {
        return this.collection
            .aggregate(
                [
                    { $match: match },
                    { $limit: 1000 },
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
                        $bucket: {
                            groupBy: '$price.priceMax',
                            boundaries: [
                                100,
                                200,
                                300,
                                400,
                                500,
                                600,
                                700,
                                800,
                                900,
                                1000,
                                1100,
                                1200,
                                1300,
                                1400,
                                1500,
                                1600,
                                1700,
                                1800,
                                1900,
                                2000,
                                2100,
                                2200
                            ],
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
                ],
                hint
            )
            .toArray()
    }
}
