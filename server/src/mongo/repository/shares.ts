import * as converter from 'csvtojson'
import { Inject, Service } from 'typedi'
import { Repository } from './repository'

import { Share } from '../entity/share'
import { GoodRepository } from './goods'
import { RegionsRepository } from './regions'

@Service()
export class SharesRepository extends Repository {
    @Inject()
    private goods!: GoodRepository

    @Inject()
    private regions!: RegionsRepository

    constructor() {
        super('shares')
    }

    public async createCollection() {
        await super.createCollection()
    }

    public async saveShares(csvFile: any): Promise<any> {
        const data = await converter({ trim: true, delimiter: '|' }).fromString(csvFile.buffer.toString())
        if (!data.length) {
            return false
        }
        await this.dropCollection()
        await this.createCollection()
        for (const item of data) {
            const share = new Share(item)
            // if (isNaN(share.regions[0])) {
            //     share.regions = (await this.regions.collection.find().toArray()).map(doc => doc._id)
            // }
            await this.collection.insertOne(share)
            await this.goods.setShare(share)
        }
        return data
    }
    public async getAll() {
        return this.collection
            .aggregate([
                {
                    $group: {
                        _id: '$id',
                        description: { $addToSet: '$description' }
                    }
                },
                {
                    $project: {
                        id: '$_id',
                        description: 1,
                        _id: 0
                    }
                }
            ])
            .toArray()
    }
}
