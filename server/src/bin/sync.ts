import { MONGO_DB, MONGO_URI } from '../config/env.config'
import logger from '../config/logger.config'
import Mongo from '../mongo/index'
import { run } from '../sync/scriptRunner'
;(async () => {
    try {
        const mongodbOptions = { url: MONGO_URI, dbName: MONGO_DB }
        await Mongo.connect(mongodbOptions)
        logger.debug('mongodb connected', mongodbOptions)
        const pipe = process.argv.slice(2)
        await run(pipe)
        process.exit(0)
    } catch (e) {
        logger.error(e.stack)
        process.exit(-1)
        throw e
    }
})()
