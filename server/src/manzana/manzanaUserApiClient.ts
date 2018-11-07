import * as requestPromise from 'request-promise-native'
import { MANZANA_CLIENT_URL } from '../config/env.config'
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
        try {
            const res = await this.call('Contact/Get')
            return Object.assign(new ManzanaUser(), res)
        } catch (e) {
            // propagate at least status code to upstream
            e.status = e.statusCode
            e.expose = true
            throw e
        }
    }

    private call(apiMethod: string, options?: any) {
        const reqOptions = {
            method: 'GET',
            uri: MANZANA_CLIENT_URL + apiMethod,
            json: true,
            qs: {
                sessionid: this.session.sessionid,
                id: this.session.id
            }
        }
        return requestPromise({ ...reqOptions, ...options })
    }
}
