import { JsonController, NotFoundError, Post, State, UseBefore } from 'routing-controllers'
import { Inject } from 'typedi'
import { ManzanaUserApiClient } from '../manzana/manzanaUserApiClient'
import { ManzanaAuthMiddleware } from '../middlewares/manzanaAuth.middleware'
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
}
