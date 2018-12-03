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
            const rp = requestPromise({
                ...ecomOptions,
                uri: `${ECOM_URL}/stocks/${store.id}`,
                timeout: 1000 * 60 * 5
            })

            let timer

            const timeout = new Promise((resolve, reject) => {
                timer = setTimeout(() => {
                    rp.abort()
                    reject(new Error('Request timed out'))
                }, 60000 * 2)
            })

            const res: { stocks: Stock[] } = await Promise.race([rp, timeout])

            clearTimeout(timer)

            const { deletedCount } = await stocksRepo.collection.deleteMany({ storeId: store.id })
            let insertedCount = 0
            // TODO: possible race condition on stocks :(
            if (res.stocks && res.stocks.length > 0) {
                const insertRes = await stocksRepo.collection.insertMany(res.stocks)
                insertedCount = insertRes.insertedCount
            }
            updatedCount++
            logger.debug(`${updatedCount + failedCount}/${storeIds.length} stocks updated. store ${store.id}`, {
                deletedCount,
                insertedCount
            })
        } catch (err) {
            failedIds.push(store.id)
            logger.error(`stocks for store ${store.id} update failed`)
            logger.error(err.stack)
            failedCount++
        }
    }
    return { updatedCount, failedCount, failedIds }
}
