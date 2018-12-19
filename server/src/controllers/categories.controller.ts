import { Get, JsonController, NotFoundError, Param, QueryParam } from 'routing-controllers'
import { Inject } from 'typedi'

import { CategoryRepository } from '../mongo/repository/categories'
import LocalizationManager from '../utils/localizationManager'

@JsonController('/categories')
export class CategoriesController {
    @Inject()
    private readonly localizationManager!: LocalizationManager
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
            throw new NotFoundError(this.localizationManager.getValue(4, id))
        }
        return res[0]
    }
}
