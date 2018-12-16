'use strict'

import 'reflect-metadata'
import { Container } from 'typedi'
import { LOCALE, MONGO_DB, MONGO_URI, NODE_ENV, PORT } from '../config/env.config'
import logger from '../config/logger.config'
import { EnglishLocale } from '../localization/en'
import { RussianLocale } from '../localization/ru'
import Mongo from '../mongo'
import { AccountManager, DevAccountManager, ProdAccountManager } from '../sbol/accountManager'
import server from '../server'
import LocalizationManager from '../utils/localizationManager'

function startServer() {
    server.listen(PORT, () => {
        logger.debug(`HTTP Server listening on port: ${PORT}`)
        logger.debug(`Environment: ${NODE_ENV}`)
    })
}

function initModules() {
    Container.set(AccountManager, NODE_ENV === 'production' ? new ProdAccountManager() : new DevAccountManager())
    Container.set(
        LocalizationManager,
        LOCALE === 'ru' ? new LocalizationManager(RussianLocale) : new LocalizationManager(EnglishLocale)
    )
}

async function start() {
    const mongodbOptions = { url: MONGO_URI, dbName: MONGO_DB }
    await Mongo.connect(mongodbOptions)
    logger.debug('mongodb connected', mongodbOptions)
    initModules()
    startServer()
}

start().catch(err => logger.error('process exit 1', { err: err.message }))
