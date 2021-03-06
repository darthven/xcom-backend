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
import LocalizationManager from '../utils/localizationManager'

@JsonController('/cards')
export class CardsController {
    @Inject()
    public virtualCardsRepository!: VirtualCardsRepository

    @Inject()
    private readonly localizationManager!: LocalizationManager

    @Post('/bindVirtual')
    @UseBefore(ManzanaAuthMiddleware)
    public async bindVirtualCard(@State('manzanaClient') manzana: ManzanaUserApiClient) {
        const virtualCard = await this.virtualCardsRepository.getRandomAvailable()
        if (!virtualCard) {
            throw new NotFoundError(this.localizationManager.getValue(0))
        }
        try {
            await manzana.bindVirtualLoyaltyCard(virtualCard)
        } catch (e) {
            e.virtualCard = virtualCard
            throw e
        }
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
            throw new BadRequestError(this.localizationManager.getValue(1))
        }
        await this.virtualCardsRepository.createCollection()
        const cards = data.map(item => {
            if (!item.field1) {
                throw new BadRequestError(`${this.localizationManager.getValue(2)} ${JSON.stringify(item)}`)
            }
            return new VirtualCard(item.field1, false)
        })
        const result = {
            inserted: 0,
            errors: 0
        }
        try {
            const writeResult = await this.virtualCardsRepository.insertBulk(cards)
            result.inserted = writeResult.insertedCount
        } catch (e) {
            if (e.name === 'BulkWriteError') {
                result.inserted = e.result.nInserted
                result.errors = e.result.getWriteErrorCount()
            } else {
                throw e
            }
        }
        logger.info('importCSV', result)
        return result
    }
}
