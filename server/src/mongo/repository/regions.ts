import { Service } from 'typedi'
import { Repository } from './repository'

@Service()
export class RegionsRepository extends Repository {
    constructor() {
        super('regions')
    }
    public async createCollection() {
        await super.createCollection()
        await this.collection.createIndex({ regionCode: 1 }, { unique: true })
    }
    public async getAll() {
        return this.collection
            .aggregate([
                {
                    $project: {
                        _id: 0,
                        id: '$regionCode',
                        name: '$region'
                    }
                },
                {
                    $sort: { id: 1 }
                }
            ])
            .toArray()
    }
}
