import 'reflect-metadata'
import { Container } from 'typedi'

import { MONGO_DB, MONGO_URI } from '../config/env.config'
import logger from '../config/logger.config'
import Mongo from '../mongo'
import { AdminsRepository } from '../mongo/repository/admins'
import { SharesRepository } from '../mongo/repository/shares'

async function start() {
    const mongodbOptions = { url: MONGO_URI, dbName: MONGO_DB }
    await Mongo.connect(mongodbOptions)
    logger.debug('mongodb connected', mongodbOptions)
    const adminsRepository = Container.get(AdminsRepository)
    await adminsRepository.dropCollection()
    await adminsRepository.createCollection()
    await Mongo.close()
}

start().catch(err => logger.error('process exit 1', { err: err.message }))
