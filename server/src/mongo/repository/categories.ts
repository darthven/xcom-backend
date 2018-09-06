import { Service } from 'typedi'
import { Repository } from './repository'

@Service()
export class CategoryRepository extends Repository {
    constructor() {
        super('categories')
    }

    public async createCollection() {
        await super.createCollection()
        await this.collection.createIndex({ name: 'text' })
        await this.collection.createIndex({ id: 1 })
    }
}
