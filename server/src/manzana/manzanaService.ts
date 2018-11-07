import * as requestPromise from 'request-promise-native'
import { Service } from 'typedi'
import { MANZANA_CLIENT_URL } from '../config/env.config'
import { ManzanaUser } from './manzanaUser'

@Service()
export class ManzanaService {
    public async getCurrentUser(sessionid: string, contactid: string): Promise<ManzanaUser> {
        const reqOptions = {
            method: 'GET',
            uri: `${MANZANA_CLIENT_URL}Contact/Get`,
            qs: {
                sessionid,
                id: contactid
            },
            json: true
        }
        try {
            const res = await requestPromise(reqOptions)
            return Object.assign(new ManzanaUser(), res)
        } catch (e) {
            // propagate at least status code to upstream
            e.status = e.statusCode
            e.expose = true
            throw e
        }
    }
}
