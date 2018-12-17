import { Get, JsonController, NotFoundError, Param, QueryParam } from 'routing-controllers'
import { Inject } from 'typedi'

import { CategoryRepository } from '../mongo/repository/categories'
import { GeneralController } from './general.controller'

@JsonController('/categories')
export class CategoriesController extends GeneralController {
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
            throw new NotFoundError(this.localizationManager.getValue(`Category not found with id {value0}`, id))
        }
        return res[0]
    }
}
