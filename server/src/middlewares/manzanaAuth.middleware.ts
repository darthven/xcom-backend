import { Context } from 'koa'
import { KoaMiddlewareInterface } from 'routing-controllers'
import { ManzanaSession } from '../manzana/manzanaSession'
import { ManzanaUserApiClient } from '../manzana/manzanaUserApiClient'

export class ManzanaAuthMiddleware implements KoaMiddlewareInterface {
    // interface implementation is optional

    public async use(ctx: Context, next: (err?: any) => Promise<any>): Promise<any> {
        const body: any = ctx.request.body || {}
        const sessionid = ctx.query.sessionid || body.sessionid || body.SessionId
        const contactid = ctx.query.id || body.id || body.Id
        ctx.state.manzanaClient = ManzanaUserApiClient.create(new ManzanaSession(sessionid, contactid))
        return next()
    }
}
