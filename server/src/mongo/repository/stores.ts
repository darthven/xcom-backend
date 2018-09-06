import { Service } from 'typedi'
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
}
