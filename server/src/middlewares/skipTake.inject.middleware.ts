import { Context } from 'koa'
import { KoaMiddlewareInterface } from 'routing-controllers'

import { SkipTake } from '../parameters/skipTake'

export class SkipTakeInjectMiddleware implements KoaMiddlewareInterface {
    public async use(context: Context, next: (err?: any) => Promise<any>): Promise<any> {
        context.state.skipTake = new SkipTake(context.query)
        return next()
    }
}
