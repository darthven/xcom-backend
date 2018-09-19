import { Get, JsonController, NotFoundError, Param, QueryParam } from 'routing-controllers'
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
    @Get('/:id')
    public async getCategoryById(@Param('id') id: number) {
        const res = await this.categories.getSingle(id)
        if (!res || !res[0]) {
            throw new NotFoundError('region not found')
        }
        return res[0]
    }
}
