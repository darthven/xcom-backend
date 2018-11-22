import * as requestPromise from 'request-promise-native'
import { Container } from 'typedi'
import { ECOM_URL } from '../config/env.config'
import logger from '../config/logger.config'
import { ecomOptions } from '../ecom/ecomOptions'
import { Stock } from '../mongo/entity/stock'
import { StocksRepository } from '../mongo/repository/stocks'
import { StoreRepository } from '../mongo/repository/stores'

/**
 * Before: updateStores
 */
export default async () => {
    const storesRepo = Container.get(StoreRepository)
    const stocksRepo = Container.get(StocksRepository)

    const storeIds: any[] = await storesRepo.collection.aggregate([{ $project: { id: 1 } }]).toArray()
    let updatedCount = 0
    let failedCount = 0
    const failedIds = []

    await stocksRepo.createCollection()

    for (const store of storeIds) {
        try {
            const res: { stocks: Stock[] } = await requestPromise({
                ...ecomOptions,
                uri: `${ECOM_URL}/stocks/${store.id}`
            })
            await stocksRepo.collection.deleteMany({ storeId: store.id })
            // TODO: possible race condition on stocks :(
            if (res.stocks && res.stocks.length > 0) {
                await stocksRepo.collection.insertMany(res.stocks)
            }
            updatedCount++
            logger.info(`${updatedCount + failedCount}/${storeIds.length} stocks updated. store ${store.id}`)
        } catch (err) {
            failedIds.push(store.id)
            logger.error(`stocks for store ${store.id} update failed`, { failedIds })
            logger.error(err.stack)
            failedCount++
        }
    }
    return { updatedCount, failedCount }
}
