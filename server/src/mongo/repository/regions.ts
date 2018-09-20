import { Service } from 'typedi'
import { Repository } from './repository'

@Service()
export class RegionsRepository extends Repository {
    constructor() {
        super('regions')
    }
    public async createCollection() {
        await super.createCollection()
        await this.collection.createIndex({ regionCode: 1 }, { unique: true })
        await this.collection.createIndex({ polygon: '2dsphere' })
    }
    public async getAll() {
        return this.collection
            .aggregate([
                {
                    $project: {
                        _id: 0,
                        id: '$regionCode',
                        name: '$region'
                    }
                },
                {
                    $sort: { id: 1 }
                }
            ])
            .toArray()
    }
    public async getSingle(id: number) {
        return this.collection
            .aggregate([
                { $match: { regionCode: id } },
                {
                    $project: {
                        _id: 0,
                        id: '$regionCode',
                        name: '$region'
                    }
                },
                {
                    $sort: { id: 1 }
                }
            ])
            .toArray()
    }
    public async getRegionByLatLng(lat: number, lng: number): Promise<any[]> {
        return this.collection
            .aggregate([
                {
                    $match: {
                        polygon: {
                            $geoIntersects: {
                                $geometry: {
                                    type: 'Point',
                                    coordinates: [lng, lat]
                                }
                            }
                        }
                    }
                },
                {
                    $project: {
                        id: '$regionCode',
                        name: '$region',
                        _id: 0
                    }
                },
                {
                    $project: {
                        polygon: 0
                    }
                }
            ])
            .toArray()
    }
}
