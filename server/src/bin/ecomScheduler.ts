import * as schedule from 'node-schedule'
import 'reflect-metadata'
import { Container } from 'typedi'

import { MONGO_DB, MONGO_URI } from '../config/env.config'
import logger from '../config/logger.config'
import { EcomUpdater } from '../ecom/updater'
import Mongo from '../mongo'

async function shedulerStart(ecomUpdater: EcomUpdater) {
    // every week
    schedule.scheduleJob('0 0 * * 0', () => {
        ecomUpdater.updatePayTypes()
        ecomUpdater.updateOrderStatuses()
        ecomUpdater.updatePrices()
    })

    // every day
    schedule.scheduleJob('0 0 * * *', () => {
        ecomUpdater.updateCategories()
        ecomUpdater.updateStores()
        ecomUpdater.updateLocations()
        ecomUpdater.updateGoods()
    })

    // every hour
    schedule.scheduleJob('0 * * * *', () => {
        ecomUpdater.updateStocks()
    })
}

async function start() {
    const mongodbOptions = { url: MONGO_URI, dbName: MONGO_DB }
    await Mongo.connect(mongodbOptions)
    logger.debug('mongodb connected', mongodbOptions)
    const ecomUpdater = Container.get(EcomUpdater)
    await shedulerStart(ecomUpdater)
}

start().catch(err => logger.error('process exit 1', { err: err.message }))
