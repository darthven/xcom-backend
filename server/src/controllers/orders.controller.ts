import { Context } from 'koa'
import { stringify } from 'querystring'
import { Get, JsonController, Req, Res, UseBefore } from 'routing-controllers'
import { Container } from 'typedi'
import { parse } from 'url'
import { ECOM_PASS, ECOM_URL, ECOM_USER } from '../config/env.config'
import logger from '../config/logger.config'
import { ManzanaService } from '../manzana/manzanaService'
import { ProxyMiddleware } from '../middlewares/proxy.middleware'

const ECOM_BASIC_AUTH_TOKEN = Buffer.from(`${ECOM_USER}:${ECOM_PASS}`).toString('base64')

@JsonController('/orders')
export class OrdersController {
    @Get()
    @UseBefore(
        ProxyMiddleware(ECOM_URL, {
            headers: {
                Authorization: `Basic ${ECOM_BASIC_AUTH_TOKEN}`
            },
            proxyReqPathResolver: async (ctx: Context) => {
                const manzana = Container.get(ManzanaService)
                const user = await manzana.getCurrentUser(ctx.query.sessionid, ctx.query.id)
                // use proxied url path with parameters
                const pathPrefix = parse(ECOM_URL).pathname
                const path = `${pathPrefix}/clients/${user.MobilePhone}/orders`
                const ecomParams = {
                    fields: 'id,date,storeId,statusId,payType',
                    expand: 'basket,statuses'
                }
                // blend original & pre-defined params
                const params = { ...ecomParams, ...ctx.query }
                // delete manzana related query params (ecom dies otherwise)
                delete params.sessionid
                delete params.id
                const newPath = `${path}?${stringify(params)}`
                logger.info(`proxied path: ${newPath}`)
                return newPath
            }
        })
    )
    public async getAll(@Req() request: any, @Res() response: any) {
        return response
    }

    @Get('/statuses')
    @UseBefore(
        ProxyMiddleware(`${ECOM_URL}order_statuses`, {
            headers: {
                Authorization: `Basic ${ECOM_BASIC_AUTH_TOKEN}`
            }
        })
    )
    public async getStatuses(@Req() request: any, @Res() response: any) {
        return response
    }
}
