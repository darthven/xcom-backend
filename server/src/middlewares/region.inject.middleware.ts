import { Context } from 'koa'
import { KoaMiddlewareInterface } from 'routing-controllers'

import { Region } from '../parameters/region'

export class RegionInjectMiddleware implements KoaMiddlewareInterface {
    public async use(context: Context, next: (err?: any) => Promise<any>): Promise<any> {
        context.state.region = new Region(context.query)
        return next()
    }
}
