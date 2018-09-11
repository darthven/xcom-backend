import { Context } from 'koa'
import { KoaMiddlewareInterface } from 'routing-controllers'

import { Ids } from '../parameters/ids'

export class IdsInjectMiddleware implements KoaMiddlewareInterface {
    public async use(context: Context, next: (err?: any) => Promise<any>): Promise<any> {
        context.state.ids = new Ids(context.query)
        return next()
    }
}
