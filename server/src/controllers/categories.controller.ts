import { Get, JsonController, QueryParam } from 'routing-controllers'
import { Inject } from 'typedi'

import { CategoryRepository } from '../mongo/repository/categories'

@JsonController('/categories')
export class AuthController {
    @Inject()
    private categories!: CategoryRepository

    @Get()
    public async getCategories(@QueryParam('query') query?: string) {
        return this.categories.collection
            .find(query ? { $text: { $search: query } } : {})
            .project({ _id: 0 })
            .toArray()
    }
}
