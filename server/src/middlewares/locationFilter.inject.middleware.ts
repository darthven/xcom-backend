import { Context } from 'koa'
import { KoaMiddlewareInterface } from 'routing-controllers'

import { LocationFilter } from '../parameters/locationFilter'

export class LocationFilterInjectMiddleware implements KoaMiddlewareInterface {
    public async use(context: Context, next: (err?: any) => Promise<any>): Promise<any> {
        context.state.locationFilter = new LocationFilter(context.query)
        return next()
    }
}
