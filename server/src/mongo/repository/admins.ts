import { Service } from 'typedi'

import { ADMINS } from '../../common/data'
import { Repository } from './repository'

@Service()
export class AdminsRepository extends Repository {
    constructor() {
        super('admins')
    }

    public async createCollection() {
        await super.createCollection()
        await super.collection.insertMany(ADMINS)
    }
}
