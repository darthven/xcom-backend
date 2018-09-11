import { Service } from 'typedi'

import { CategoriesQuery } from '../queries/CategoriesQuery'
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

    public async getAll(search: string | undefined) {
        const query = new CategoriesQuery(search)
        return this.collection
            .find(query)
            .project({ _id: 0 })
            .toArray()
    }
}
