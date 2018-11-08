import * as requestPromise from 'request-promise-native'
import { MANZANA_CLIENT_URL } from '../config/env.config'
import { VirtualCard } from '../mongo/entity/virtualCard'
import { BindCardRequest } from './bindCardRequest'
import { ManzanaSession } from './manzanaSession'
import { ManzanaUser } from './manzanaUser'

export class ManzanaUserApiClient {
    public static create(session: ManzanaSession): ManzanaUserApiClient {
        return new ManzanaUserApiClient(session)
    }
    private session!: ManzanaSession

    private constructor(session: ManzanaSession) {
        this.session = session
    }

    public async getCurrentUser(): Promise<ManzanaUser> {
        const res = await this.call('Contact/Get')
        return Object.assign(new ManzanaUser(), res)
    }

    public async bindVirtualLoyaltyCard(card: VirtualCard) {
        return this.call('Contact/BindCard', {
            method: 'POST',
            body: new BindCardRequest(card.cardNumber, this.session.id, this.session.sessionid)
        })
    }

    private async call(apiMethod: string, options?: any) {
        const defaultOpts = {
            method: 'GET',
            uri: MANZANA_CLIENT_URL + apiMethod,
            json: true,
            qs: {
                sessionid: this.session.sessionid,
                id: this.session.id
            }
        }
        try {
            return await requestPromise({ ...defaultOpts, ...options })
        } catch (e) {
            // propagate at least status code to upstream
            e.status = e.statusCode
            e.expose = true
            throw e
        }
    }
}
