import { Service } from 'typedi'

import { IMAGE_CATEGORIES_FOLDER, IMAGE_URL } from '../../config/env.config'
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
            .aggregate([
                { $match: query },
                {
                    $project: {
                        id: 1,
                        name: 1,
                        parentId: 1,
                        level: 1,
                        productCount: 1,
                        icon: {
                            url: { $concat: [IMAGE_URL, IMAGE_CATEGORIES_FOLDER, '$img'] },
                            urls: null,
                            urlm: null
                        },
                        _id: 0
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
                        id: 1,
                        name: 1,
                        parentId: 1,
                        level: 1,
                        productCount: 1,
                        icon: {
                            url: { $concat: [IMAGE_URL, IMAGE_CATEGORIES_FOLDER, '$img'] },
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
