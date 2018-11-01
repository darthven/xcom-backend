/// <reference types="koa-router" />
import { Context } from 'koa';
import { KoaMiddlewareInterface } from 'routing-controllers';
export declare class ProductFilterInjectMiddleware implements KoaMiddlewareInterface {
    use(context: Context, next: (err?: any) => Promise<any>): Promise<any>;
}
