import { Context } from 'koa'
import { stringify } from 'querystring'
import * as requestPromise from 'request-promise-native'
import { Ctx, Get, JsonController, NotFoundError, Param, Req, Res, State, UseBefore } from 'routing-controllers'
import { parse } from 'url'
import { LoggingMiddleware } from '../../lib/middlewares/logging.middleware'
import { ECOM_URL, MANZANA_CLIENT_URL } from '../config/env.config'
import logger from '../config/logger.config'
import { ecomOptions } from '../ecom/ecomOptions'
import { ProxyMiddleware } from '../middlewares/proxy.middleware'

const ECOM_BASIC_AUTH_TOKEN = Buffer.from(`${ecomOptions.auth.user}:${ecomOptions.auth.pass}`).toString('base64')

@JsonController('/orders')
export class GoodsController {
    @Get()
    @UseBefore(
        ProxyMiddleware(ECOM_URL, {
            headers: {
                Authorization: `Basic ${ECOM_BASIC_AUTH_TOKEN}`
            },
            proxyReqPathResolver: async (ctx: Context): Promise<string> => {
                const reqOptions = {
                    method: 'GET',
                    uri: `${MANZANA_CLIENT_URL}Contact/Get`,
                    qs: {
                        sessionid: ctx.query.sessionid,
                        id: ctx.query.id
                    },
                    json: true
                }
                let user
                try {
                    user = await requestPromise(reqOptions)
                } catch (e) {
                    // propagate at least status code to upstream
                    e.status = e.statusCode
                    e.expose = true
                    throw e
                }
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
