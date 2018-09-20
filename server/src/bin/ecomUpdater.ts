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
    // await ecomUpdater.updatePrices()
    // await ecomUpdater.updateLocations()
    // await ecomUpdater.updateStationsNear()
    await ecomUpdater.updateStoreTypes()
    await ecomUpdater.updateImages()
    await Mongo.close()
}

start().catch(err => {
    logger.error('process exit 1', { err: err.message })
    Mongo.close()
})
