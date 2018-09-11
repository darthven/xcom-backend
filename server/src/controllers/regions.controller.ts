import { Get, JsonController } from 'routing-controllers'
import { Inject } from 'typedi'

import { RegionsRepository } from '../mongo/repository/regions'

@JsonController('/regions')
export class RegionsController {
    @Inject()
    private regions!: RegionsRepository

    @Get()
    public async getLocations() {
        return this.regions.getAll()
    }
}
