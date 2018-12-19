import { BadRequestError, Get, JsonController, NotFoundError, Param } from 'routing-controllers'
import { Inject } from 'typedi'

import { RegionsRepository } from '../mongo/repository/regions'
import LocalizationManager from '../utils/localizationManager'

@JsonController('/regions')
export class RegionsController {
    @Inject()
    private regions!: RegionsRepository
    @Inject()
    private readonly localizationManager!: LocalizationManager

    @Get()
    public async getRegions() {
        return this.regions.getAll()
    }
    @Get('/:id')
    public async getRegionById(@Param('id') id: number) {
        const res = await this.regions.getSingle(id)
        if (!res || !res[0]) {
            throw new NotFoundError(this.localizationManager.getValue(3))
        }
        return res[0]
    }
    @Get('/lat/:lat/lng/:lng')
    public async getRegionByLatLng(@Param('lat') lat: number, @Param('lng') lng: number) {
        let res
        try {
            res = await this.regions.getRegionByLatLng(lat, lng)
        } catch (e) {
            throw new BadRequestError(e.message)
        }
        if (!res || !res[0]) {
            throw new NotFoundError(this.localizationManager.getValue(3))
        }
        return res[0]
    }
}
