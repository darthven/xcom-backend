import { Service } from 'typedi'
import { LocationsQuery } from '../queries/LocationsQuery'
import { Repository } from './repository'

@Service()
export class StoreRepository extends Repository {
    constructor() {
        super('stores')
    }
    public async createCollection() {
        await super.createCollection()
        await this.collection.createIndex({ id: 1 }, { unique: true })
    }

    public async getMinMax() {
        return this.collection
            .aggregate(
                [
                    {
                        $project: {
                            _id: 0,
                            stocks: 1
                        }
                    },
                    { $unwind: '$stocks' },
                    {
                        $group: {
                            _id: { goodsId: '$stocks.goodsId', region: '$stocks.region' },
                            priceMin: { $min: '$stocks.storePrice' },
                            priceMax: { $max: '$stocks.storePrice' },
                            available: { $max: '$stocks.quantity' }
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
            .toArray()
    }

    public async getLocations(query: LocationsQuery) {
        return this.collection
            .aggregate([
                { $match: query },
                {
                    $project: {
                        _id: 0,
                        id: 1,
                        region: '$regionCode',
                        type: '$storeType',
                        address: 1,
                        phone: '$phoneNumber',
                        workTime: 1,
                        location: 1
                    }
                }
            ])
            .toArray()
    }
    public async getLocationsType() {
        const res = await this.collection
            .aggregate([
                {
                    $group: {
                        _id: { storeType: '$storeType' },
                        name: { $first: '$storeType' },
                        count: { $sum: 1 }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        name: 1,
                        count: 1
                    }
                }
            ])
            .toArray()
        return res.filter(item => (item.name ? item : null))
    }
}
