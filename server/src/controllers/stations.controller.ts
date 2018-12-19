import { Get, JsonController, NotFoundError, Param } from 'routing-controllers'
import { Inject } from 'typedi'

import { StationsRepository } from '../mongo/repository/stations'
import LocalizationManager from '../utils/localizationManager'

@JsonController('/stations')
export class StationsController {
    @Inject()
    private stations!: StationsRepository
    @Inject()
    private readonly localizationManager!: LocalizationManager

    @Get()
    public async getStations() {
        return this.stations.getAll()
    }
    @Get('/:id')
    public async getStationById(@Param('id') id: number) {
        const res = await this.stations.getSingle(id)
        if (!res || !res[0]) {
            throw new NotFoundError(this.localizationManager.getValue(5))
        }
        return res[0]
    }
}
