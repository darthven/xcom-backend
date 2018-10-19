import { Authorized, Get, JsonController, Post, UploadedFile } from 'routing-controllers'
import { Inject } from 'typedi'

import { SharesRepository } from '../mongo/repository/shares'

@JsonController('/shares')
export class SharesController {
    @Inject()
    private shares!: SharesRepository

    @Authorized()
    @Post()
    public uploadCSVFile(@UploadedFile('shares', { required: true }) file: any) {
        return this.shares.saveShares(file)
    }
    @Get()
    public getShares() {
        return this.shares.getAll()
    }
}
