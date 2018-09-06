import { Service } from 'typedi'
import { Repository } from './repository'

@Service()
export class OrderStatusRepository extends Repository {
    constructor() {
        super('orderStatuses')
    }
    public async createCollection() {
        await super.createCollection()
        await this.collection.createIndex({ id: 1 }, { unique: true })
    }
}
