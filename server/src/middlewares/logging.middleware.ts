import { Context } from 'koa'
import { KoaMiddlewareInterface, Middleware } from 'routing-controllers'
import logger from '../config/logger.config'

let i: number = 0

@Middleware({ type: 'before' })
export class LoggingMiddleware implements KoaMiddlewareInterface {
    public async use(context: Context, next: (err?: any) => Promise<any>): Promise<any> {
        logger.info(`REQ ${i} ${context.method} ${context.url}`, {
            body: context.request.body,
            ip: context.ip
        })
        await next()
        logger.info(`RES ${i} ${context.method} ${context.url}`, {
            statusCode: context.response.status
        })
        i++
    }
}
