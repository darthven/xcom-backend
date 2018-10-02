import { Context } from 'koa'
import { KoaMiddlewareInterface } from 'routing-controllers'

import { QueryType } from '../parameters/queryType'

export class QueryTypeInjectMiddleware implements KoaMiddlewareInterface {
    public async use(context: Context, next: (err?: any) => Promise<any>): Promise<any> {
        context.state.queryType = new QueryType(context.query)
        return next()
    }
}
