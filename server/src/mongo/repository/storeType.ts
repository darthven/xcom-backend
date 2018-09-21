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
        await this.collection.createIndex({ name: 1 })
    }
    public async getAll() {
        return this.collection
            .aggregate([
                {
                    $project: {
                        name: 1,
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
    public async getAllByRegion(region: number) {
        return this.collection
            .aggregate([
                {
                    $project: {
                        _id: 0,
                        count: 0
                    }
                },
                { $unwind: '$regions' },
                { $match: { 'regions.region': region } },
                {
                    $project: {
                        name: 1,
                        count: '$regions.count',
                        icon: {
                            url: { $concat: [IMAGE_URL, IMAGE_STORE_TYPE_FOLDER, '$img'] },
                            urls: null,
                            urlm: null
                        }
                    }
                }
            ])
            .toArray()
    }
}
