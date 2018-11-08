import * as koa from 'koa'
import * as proxy from 'koa-better-http-proxy'
import { stringify } from 'querystring'
import { KoaMiddlewareInterface } from 'routing-controllers'
import { parse, UrlWithParsedQuery } from 'url'
import logger from '../config/logger.config'

export function ProxyMiddleware(url: string, options?: proxy.IOptions) {
    return class implements KoaMiddlewareInterface {
        public readonly proxyUrl: UrlWithParsedQuery

        constructor() {
            this.proxyUrl = parse(url, true)
        }

        public async use(context: any, next: (err?: any) => Promise<any>): Promise<any> {
            const defaults: proxy.IOptions = {
                proxyReqPathResolver: this.pathResolver
                // proxyReqOptDecorator: this.reqDecorator
            }
            return proxy(url, { ...defaults, ...options })(context, next)
        }

        public pathResolver = (ctx: koa.Context): string => {
            // use proxied url path with parameters
            const params = stringify({ ...this.proxyUrl.query, ...ctx.query })
            return `${this.proxyUrl.pathname}?${params}`
        }
    }
}
