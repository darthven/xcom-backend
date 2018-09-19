import { Service } from 'typedi'
import { Repository } from './repository'

@Service()
export class StationsRepository extends Repository {
    constructor() {
        super('stations')
    }
    public async createCollection() {
        await super.createCollection()
        await this.collection.createIndex({ id: 1 }, { unique: true })
    }
    public async getAll() {
        return this.collection
            .aggregate([
                {
                    $project: {
                        _id: 0,
                        id: 1,
                        name: 1,
                        location: 1,
                        city: 1
                    }
                },
                {
                    $sort: { id: 1 }
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
                        location: 1,
                        city: 1
                    }
                }
            ])
            .toArray()
    }
}
