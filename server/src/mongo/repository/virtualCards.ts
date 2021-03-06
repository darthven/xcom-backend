import { Service } from 'typedi'
import { VirtualCard } from '../entity/virtualCard'
import { Repository } from './repository'

@Service()
export class VirtualCardsRepository extends Repository {
    constructor() {
        super('virtualCards')
    }

    public async createCollection() {
        await super.createCollection()
        await this.collection.createIndex({ cardNumber: 1 }, { unique: true })
    }

    public async getRandomAvailable(): Promise<VirtualCard> {
        return this.collection
            .aggregate([
                {
                    $match: { used: false }
                },
                {
                    $sample: { size: 1 }
                },
                {
                    $project: { _id: 0 }
                }
            ])
            .next()
    }

    public async updateOne(virtualCard: VirtualCard) {
        return this.collection.updateOne({ cardNumber: virtualCard.cardNumber }, { $set: virtualCard })
    }

    public async insertBulk(virtualCards: VirtualCard[]) {
        return this.collection.insertMany(virtualCards, { ordered: false })
    }
}
