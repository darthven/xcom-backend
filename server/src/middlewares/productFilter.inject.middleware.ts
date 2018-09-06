import { Context } from 'koa'
import { KoaMiddlewareInterface } from 'routing-controllers'

import { ProductFilter } from '../parameters/productFilter'

export class ProductFilterInjectMiddleware implements KoaMiddlewareInterface {
    public async use(context: Context, next: (err?: any) => Promise<any>): Promise<any> {
        context.state.productFilter = new ProductFilter(context.query)
        return next()
    }
}
