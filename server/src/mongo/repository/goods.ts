import { Service } from 'typedi'

import {
    IMAGE_DEFAULT_TYPE,
    IMAGE_GOOD_FOLDER,
    IMAGE_M_SUBFOLDER,
    IMAGE_S_SUBFOLDER,
    IMAGE_URL
} from '../../config/env.config'
import { Region } from '../../parameters/region'
import { SkipTake } from '../../parameters/skipTake'
import { GoodsHint } from '../queries/GoodsHint'
import { GoodsNullQuery } from '../queries/GoodsNullQuery'
import { GoodsSort } from '../queries/GoodsSort'
import { GoodsStrictQuery } from '../queries/GoodsStrictQuery'
import { Repository } from './repository'

@Service()
export class GoodRepository extends Repository {
    private firstProject = {
        _id: 0,
        id: 1,
        name: 1,
        manufacturer: 1,
        siteCatId: 1,
        country: 1,
        mnn: 1,
        price: 1,
        img: 1
    }
    private secondProject = {
        id: 1,
        name: 1,
        manufacturer: 1,
        country: 1,
        activeSubstance: '$mnn',
        categoryId: '$siteCatId',
        priceMin: '$price.priceMin',
        priceMax: '$price.priceMax',
        icon: {
            url: { $concat: [IMAGE_URL, IMAGE_GOOD_FOLDER, '$img'] },
            urls: { $concat: [IMAGE_URL, IMAGE_GOOD_FOLDER, IMAGE_S_SUBFOLDER, '$img'] },
            urlm: { $concat: [IMAGE_URL, IMAGE_GOOD_FOLDER, IMAGE_M_SUBFOLDER, '$img'] }
        }
    }
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

    public async updateImageLink(id: number) {
        return this.collection.updateOne({ id }, { $set: { img: `${id}${IMAGE_DEFAULT_TYPE}` } })
    }

    public async getAll(
        match: GoodsStrictQuery,
        withoutPriceMatch: GoodsNullQuery,
        skipTake: SkipTake,
        region: Region,
        sort: GoodsSort,
        hint: GoodsHint
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
            data
        }
    }
    public async getAllWithPrice(match: GoodsStrictQuery, skipTake: SkipTake, region: Region, sort: GoodsSort) {
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
    public async getByIds(ids: number[], region: Region) {
        return this.collection
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
    }
    public async getSingle(id: number, region: Region) {
        return this.collection
            .aggregate([
                { $match: { id } },
                { $project: this.firstProject },
                { $unwind: '$price' },
                { $match: { 'price.region': region.region } },
                {
                    $project: {
                        id: '$_id',
                        _id: 0,
                        name: 1,
                        manufacturer: 1,
                        country: 1,
                        categoryId: '$siteCatId',
                        priceMin: '$price.priceMin',
                        priceMax: '$price.priceMax',
                        availableCount: '$price.available',
                        icon: {
                            url: { $concat: [IMAGE_URL, IMAGE_GOOD_FOLDER, '$img'] },
                            urls: { $concat: [IMAGE_URL, IMAGE_GOOD_FOLDER, IMAGE_S_SUBFOLDER, '$img'] },
                            urlm: { $concat: [IMAGE_URL, IMAGE_GOOD_FOLDER, IMAGE_M_SUBFOLDER, '$img'] }
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
