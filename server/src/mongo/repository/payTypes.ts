import { Service } from 'typedi'
import { Repository } from './repository'

@Service()
export class PayTypeRepository extends Repository {
    constructor() {
        super('payTypes')
    }
    public async createCollection() {
        await super.createCollection()
        await this.collection.createIndex({ id: 1 }, { unique: true })
    }
}
