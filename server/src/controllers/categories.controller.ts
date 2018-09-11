import { Get, JsonController, QueryParam } from 'routing-controllers'
import { Inject } from 'typedi'

import { CategoryRepository } from '../mongo/repository/categories'

@JsonController('/categories')
export class CategoriesController {
    @Inject()
    private categories!: CategoryRepository

    @Get()
    public async getCategories(@QueryParam('query') query?: string) {
        return this.categories.getAll(query)
    }
}
