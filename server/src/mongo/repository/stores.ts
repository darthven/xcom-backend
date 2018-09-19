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

    public async getAll(query: LocationsQuery) {
        return this.collection
            .aggregate([
                { $match: query },
                {
                    $project: {
                        _id: 0,
                        id: 1,
                        name: 1,
                        region: '$regionCode',
                        type: '$storeType',
                        address: 1,
                        phone: '$phoneNumber',
                        workTime: 1,
                        location: 1,
                        stations: 1
                    }
                }
            ])
            .toArray()
    }
    public async getSingle(id: number) {
        return this.collection
            .aggregate([
                { $match: { id } },
                {
                    $project: {
                        _id: 0,
                        id: 1,
                        name: 1,
                        region: '$regionCode',
                        type: '$storeType',
                        address: 1,
                        phone: '$phoneNumber',
                        workTime: 1,
                        location: 1,
                        stations: 1
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
                    }
                },
                {
                    $project: {
                        _id: 0,
                        name: 1
                    }
                }
            ])
            .toArray()
        return res.filter(item => (item.name ? item : null))
    }
    public async getRegions() {
        return this.collection
            .aggregate([
                {
                    $project: {
                        _id: 0,
                        region: 1,
                        regionCode: 1
                    }
                },
                {
                    $group: {
                        _id: '$regionCode',
                        region: { $first: '$region' }
                    }
                },
                {
                    $project: {
                        regionCode: '$_id',
                        region: 1,
                        _id: 0
                    }
                }
            ])
            .toArray()
    }
}
