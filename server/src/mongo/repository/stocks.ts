import { AggregationCursor } from 'mongodb'
import { Service } from 'typedi'
import { Stock } from '../entity/stock'
import { Repository } from './repository'

@Service()
export class StocksRepository extends Repository {
    constructor() {
        super('stocks')
    }

    public async createCollection(): Promise<void> {
        await super.createCollection()
        await this.collection.createIndex({ goodsId: 1 })
        // unique compound index
        await this.collection.createIndex({ storeId: 1, goodsId: 1, batch: 1 }, { unique: true })
    }

    public async getForStores(storeIds: number[], ids: number[]): Promise<Stock[]> {
        return this.collection
            .aggregate([
                {
                    $match: {
                        storeId: { $in: storeIds },
                        goodsId: { $in: ids }
                    }
                },
                {
                    $project: {
                        _id: 0
                    }
                }
            ])
            .toArray()
    }

    public getMinMaxCursor(): AggregationCursor<{ id: number; price: Price }> {
        return this.collection.aggregate(
            [
                {
                    $group: {
                        _id: { goodsId: '$goodsId', region: '$region' },
                        priceMin: { $min: '$storePrice' },
                        priceMax: { $max: '$storePrice' },
                        available: { $max: '$quantity' }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        id: '$_id.goodsId',
                        region: '$_id.region',
                        priceMin: 1,
                        priceMax: 1,
                        available: 1
                    }
                },
                {
                    $group: {
                        _id: '$id',
                        price: {
                            $push: {
                                region: '$region',
                                priceMin: '$priceMin',
                                priceMax: '$priceMax',
                                available: '$available'
                            }
                        }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        id: '$_id',
                        price: 1
                    }
                }
            ],
            { allowDiskUse: true }
        )
    }
}

export interface Price {
    region: number
    priceMin: number
    priceMax: number
    available: number
}
