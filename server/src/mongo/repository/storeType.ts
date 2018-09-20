import { Service } from 'typedi'
import { IMAGE_STORE_TYPE_FOLDER, IMAGE_URL } from '../../config/env.config'
import { Repository } from './repository'

@Service()
export class StoreTypeRepository extends Repository {
    constructor() {
        super('storeTypes')
    }
    public async createCollection() {
        await super.createCollection()
    }
    public async getAll(region?: number) {
        return this.collection
            .aggregate([
                {
                    $lookup: {
                        from: 'stores',
                        localField: 'name',
                        foreignField: 'storeType',
                        as: 'stores'
                    }
                },
                { $unwind: '$stores' },
                { $match: { 'stores.regionCode': region } },
                {
                    $group: {
                        _id: '$name',
                        count: { $sum: 1 },
                        img: { $first: '$img' }
                    }
                },
                {
                    $project: {
                        name: '$_id',
                        count: 1,
                        icon: {
                            url: { $concat: [IMAGE_URL, IMAGE_STORE_TYPE_FOLDER, '$img'] },
                            urls: null,
                            urlm: null
                        },
                        _id: 0
                    }
                }
            ])
            .toArray()
    }
}
