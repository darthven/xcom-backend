import 'reflect-metadata'
import { Container } from 'typedi'

import { MONGO_DB, MONGO_URI } from '../config/env.config'
import logger from '../config/logger.config'
import { EcomUploader } from '../ecom/uploader'
import Mongo from '../mongo'

async function start() {
    const mongodbOptions = { url: MONGO_URI, dbName: MONGO_DB }
    await Mongo.connect(mongodbOptions)
    logger.debug('mongodb connected', mongodbOptions)
    const ecomUploader = Container.get(EcomUploader)
    await ecomUploader.uploadPayTypes()
    await ecomUploader.uploadOrderStatuses()
    await ecomUploader.uploadStores()
    await ecomUploader.uploadGoods()
    await ecomUploader.uploadCategories()
    await ecomUploader.uploadStocks()
    await Mongo.close()
}

start().catch(err => logger.error('process exit 1', err.message))
