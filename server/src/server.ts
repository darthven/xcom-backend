import * as Koa from 'koa'
import 'reflect-metadata'
import { useContainer, useKoaServer } from 'routing-controllers'
import Container from 'typedi'

import { authorizationChecker } from './middlewares/basicAuthChecker'
import { LoggingMiddleware } from './middlewares/logging.middleware'

useContainer(Container)

const koa = new Koa()

export default useKoaServer(koa, {
    routePrefix: '/api',
    authorizationChecker,
    middlewares: [LoggingMiddleware],
    controllers: [__dirname + '/controllers/**/*'],
    validation: {
        skipMissingProperties: true
    }
})
