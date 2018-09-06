import { Service } from 'typedi'
import { Region } from '../../parameters/region'
import { SkipTake } from '../../parameters/skipTake'
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
        await this.collection.createIndex({ 'price.region': 1 })
    }
    public async getDensity(match: any, region: Region) {
        return this.collection
            .aggregate([
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
            ])
            .toArray()
    }
    public async getAll(match: any, skipTake: SkipTake, region: Region) {
        return this.collection
            .aggregate([
                { $match: match },
                { $skip: skipTake.skip || 0 },
                { $limit: skipTake.take || 10000 },
                {
                    $project: {
                        _id: 0,
                        id: 1,
                        name: 1,
                        manufacturer: 1,
                        siteCatId: 1,
                        price: 1
                    }
                },
                { $unwind: '$price' },
                { $match: { 'price.region': region.region } },
                { $sort: { name: 1 } },
                {
                    $project: {
                        id: 1,
                        name: 1,
                        manufacturer: 1,
                        categoryId: 1,
                        priceMin: '$price.priceMin',
                        priceMax: '$price.priceMax'
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
                        siteCatId: 1
                    }
                },
                {
                    $lookup: {
                        from: 'stocks',
                        localField: 'id',
                        foreignField: 'goodsId',
                        as: 'price'
                    }
                },
                { $unwind: '$price' },
                { $match: { 'price.region': region.region } },
                {
                    $group: {
                        _id: '$id',
                        name: { $first: '$name' },
                        manufacturer: { $first: '$manufacturer' },
                        categoryId: { $first: '$siteCatId' },
                        availableCount: { $max: '$price.quantity' },
                        priceMin: { $min: '$price.storePrice' },
                        priceMax: { $max: '$price.storePrice' }
                    }
                },
                {
                    $project: {
                        id: '$_id',
                        _id: 0,
                        name: 1,
                        manufacturer: 1,
                        categoryId: 1,
                        priceMin: 1,
                        priceMax: 1,
                        availableCount: 1
                    }
                }
            ])
            .toArray()
    }
    public async getMinMaxPrice(id: number, region: number) {
        const res = await this.collection
            .aggregate([
                { $match: { id } },
                {
                    $project: {
                        _id: 0,
                        id: 1
                    }
                },
                {
                    $lookup: {
                        from: 'stocks',
                        localField: 'id',
                        foreignField: 'goodsId',
                        as: 'price'
                    }
                },
                { $unwind: '$price' },
                { $match: { 'price.region': region } },
                {
                    $group: {
                        _id: '$id',
                        region: { $first: '$price.region' },
                        priceMin: { $min: '$price.storePrice' },
                        priceMax: { $max: '$price.storePrice' }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        region: 1,
                        priceMin: 1,
                        priceMax: 1
                    }
                }
            ])
            .toArray()
        return res[0]
    }
}
