import { Service } from 'typedi'
import { IMAGE_STORE_TYPE_FOLDER, IMAGE_URL } from '../../config/env.config'
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
        await this.collection.createIndex({ storeType: 1 })
        await this.collection.createIndex({ region: 1 })
        await this.collection.createIndex({ regionCode: 1 })
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
                        storeType: 1,
                        address: 1,
                        phone: '$phoneNumber',
                        workTime: 1,
                        location: 1,
                        stations: 1
                    }
                },
                {
                    $lookup: {
                        from: 'storeTypes',
                        localField: 'storeType',
                        foreignField: 'name',
                        as: 'type'
                    }
                },
                { $unwind: '$type' },
                {
                    $project: {
                        id: 1,
                        name: 1,
                        region: 1,
                        address: 1,
                        phone: 1,
                        workTime: 1,
                        location: 1,
                        stations: 1,
                        'type.name': 1,
                        'type.icon': {
                            url: { $concat: [IMAGE_URL, IMAGE_STORE_TYPE_FOLDER, '$type.img'] },
                            urls: null,
                            urlm: null
                        }
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
                        storeType: 1,
                        address: 1,
                        phone: '$phoneNumber',
                        workTime: 1,
                        location: 1,
                        stations: 1
                    }
                },
                {
                    $lookup: {
                        from: 'storeTypes',
                        localField: 'storeType',
                        foreignField: 'name',
                        as: 'type'
                    }
                },
                { $unwind: '$type' },
                {
                    $project: {
                        id: 1,
                        name: 1,
                        region: 1,
                        address: 1,
                        phone: 1,
                        workTime: 1,
                        location: 1,
                        stations: 1,
                        'type.name': 1,
                        'type.icon': {
                            url: { $concat: [IMAGE_URL, IMAGE_STORE_TYPE_FOLDER, '$type.img'] },
                            urls: null,
                            urlm: null
                        }
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
                        _id: { storeType: '$storeType', region: '$regionCode' },
                        name: { $first: '$storeType' },
                        region: { $first: '$regionCode' },
                        count: { $sum: 1 }
                    }
                },
                {
                    $group: {
                        _id: { name: '$name' },
                        name: { $first: '$name' },
                        count: { $sum: '$count' },
                        regions: {
                            $push: { region: '$region', count: '$count' }
                        }
                    }
                },
                {
                    $project: {
                        _id: 0
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


/*

debug: indexes {"0":{"v":2,"key":{"_id":1},"name":"_id_","ns":"xcom-prod.stores"},"1":{"v":2,"unique":true,"key":{"id":1},"name":"id_1","ns":"xcom-prod.stores"},"2":{"v":2,"key":{"storeType":1},"name":"storeType_1","ns":"xcom-prod.stores"},"3":{"v":2,"key":{"region":1},"name":"region_1","ns":"xcom-prod.stores"},"4":{"v":2,"key":{"regionCode":1},"name":"regionCode_1","ns":"xcom-prod.stores"}
*/
