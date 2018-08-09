import { NODE_ENV, PORT } from './config/env.config'
import logger from './config/logger.config'
import server from './server'

// START SERVER
server.listen(
    PORT,
    (): void => {
        logger.info(`HTTP Server listening on port: ${PORT}`)
        logger.info(`Environment: ${NODE_ENV}`)
    }
)
