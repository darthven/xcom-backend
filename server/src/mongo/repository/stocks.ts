import { Service } from 'typedi'
import { Repository } from './repository'

@Service()
export class StocksRepository extends Repository {
    constructor() {
        super('stocks')
    }

    public async createCollection(): Promise<void> {
        await super.createCollection()
        await this.collection.createIndex({ goodsId: 1 })
        // unique compound index
        await this.collection.createIndex({ storeId: 1, goodsId: 1, batch: 1 }, { unique: true })
    }
}
