import 'reflect-metadata'
import { Container } from 'typedi'

import { MONGO_DB, MONGO_URI } from '../config/env.config'
import logger from '../config/logger.config'
import { EcomUpdater } from '../ecom/updater'
import Mongo from '../mongo'

async function start() {
    const mongodbOptions = { url: MONGO_URI, dbName: MONGO_DB }
    await Mongo.connect(mongodbOptions)
    logger.debug('mongodb connected', mongodbOptions)
    const ecomUpdater = Container.get(EcomUpdater)
    await ecomUpdater.updatePayTypes()
    await ecomUpdater.updateOrderStatuses()
    await ecomUpdater.updateStores()
    await ecomUpdater.updateGoods()
    await ecomUpdater.updateCategories()
    await ecomUpdater.updateStocks()
    await ecomUpdater.updatePrices()
    await Mongo.close()
}

start().catch(err => logger.error('process exit 1', err.message))
