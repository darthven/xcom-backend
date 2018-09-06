import { Service } from 'typedi'
import { Repository } from './repository'

@Service()
export class StockRepository extends Repository {
    constructor() {
        super('stocks')
    }

    public async createCollection() {
        await super.createCollection()
        await this.collection.createIndex({ goodsId: 1 })
        await this.collection.createIndex({ region: 1 })
        await this.collection.createIndex({ storePrice: 1 })
        await this.collection.createIndex({ storePrice: 1, region: -1 })
        await this.collection.createIndex({ goodsId: 1, region: 1, storeId: 1 }, { unique: true })
        await this.collection.createIndex({ goodsId: 1, storeId: -1 }, { unique: true })
        await this.collection.createIndex({ goodsId: 1, storePrice: -1 })
    }
}
