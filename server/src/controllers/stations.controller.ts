import { Get, JsonController, NotFoundError, Param } from 'routing-controllers'
import { Inject } from 'typedi'

import { StationsRepository } from '../mongo/repository/stations'
import { GeneralController } from './general.controller'

@JsonController('/stations')
export class StationsController extends GeneralController {
    @Inject()
    private stations!: StationsRepository

    @Get()
    public async getStations() {
        return this.stations.getAll()
    }
    @Get('/:id')
    public async getStationById(@Param('id') id: number) {
        const res = await this.stations.getSingle(id)
        if (!res || !res[0]) {
            throw new NotFoundError('store not found')
        }
        return res[0]
    }
}
