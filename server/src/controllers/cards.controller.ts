import * as converter from 'csvtojson'
import {
    Authorized,
    BadRequestError,
    JsonController,
    NotFoundError,
    Post,
    State,
    UploadedFile,
    UseBefore
} from 'routing-controllers'
import { Inject } from 'typedi'
import logger from '../config/logger.config'
import { ManzanaUserApiClient } from '../manzana/manzanaUserApiClient'
import { ManzanaAuthMiddleware } from '../middlewares/manzanaAuth.middleware'
import { VirtualCard } from '../mongo/entity/virtualCard'
import { VirtualCardsRepository } from '../mongo/repository/virtualCards'

@JsonController('/cards')
export class CardsController {
    @Inject()
    public virtualCardsRepository!: VirtualCardsRepository

    @Post('/bindVirtual')
    @UseBefore(ManzanaAuthMiddleware)
    public async bindVirtualCard(@State('manzanaClient') manzana: ManzanaUserApiClient) {
        const virtualCard = await this.virtualCardsRepository.getRandomAvailable()
        if (!virtualCard) {
            throw new NotFoundError('No available virtual cards found')
        }
        await manzana.bindVirtualLoyaltyCard(virtualCard)
        virtualCard.used = true
        await this.virtualCardsRepository.updateOne(virtualCard)
        return virtualCard
    }

    @Authorized()
    @Post('/importCSV')
    public async uploadCSVFile(@UploadedFile('cards', { required: true }) file: any) {
        // TODO: optimize with file streaming ?
        const data = await converter({ trim: true, delimiter: ',', noheader: true }).fromString(file.buffer.toString())
        if (!data.length) {
            throw new BadRequestError('File is empty')
        }
        await this.virtualCardsRepository.createCollection()
        const cards = data.map(item => {
            if (!item.field1) {
                throw new BadRequestError(`File has incorrect format. Encountered row: ${JSON.stringify(item)}`)
            }
            return new VirtualCard(item.field1, false)
        })
        await this.virtualCardsRepository.insertBulk(cards)
        logger.info(`imported ${data.length} records from csv file`)
        return {
            success: true,
            message: `imported ${data.length} records from csv file`
        }
    }
}
