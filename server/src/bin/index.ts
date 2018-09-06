'use strict'

import 'reflect-metadata'
import { MONGO_DB, MONGO_URI, NODE_ENV, PORT } from '../config/env.config'
import logger from '../config/logger.config'
import Mongo from '../mongo/index'
import server from '../server'

function startServer() {
    server.listen(PORT, () => {
        logger.debug(`HTTP Server listening on port: ${PORT}`)
        logger.debug(`Environment: ${NODE_ENV}`)
    })
}

async function start() {
    const mongodbOptions = { url: MONGO_URI, dbName: MONGO_DB }
    await Mongo.connect(mongodbOptions)
    logger.debug('mongodb connected', mongodbOptions)
    startServer()
}

start().catch(err => logger.error('process exit 1', err.message))
