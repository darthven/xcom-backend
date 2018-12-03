import * as appRoot from 'app-root-path'
import * as fs from 'fs'
import { Container } from 'typedi'
import logger from '../config/logger.config'
import { RegionsRepository } from '../mongo/repository/regions'
import { StoreRepository } from '../mongo/repository/stores'

/**
 * Before: updateStores
 */
export default async () => {
    const storesRepo = Container.get(StoreRepository)
    const regionsRepo = Container.get(RegionsRepository)

    const regions = await storesRepo.collection
        .aggregate([
            {
                $project: {
                    _id: 0,
                    region: 1,
                    regionCode: 1
                }
            },
            {
                $group: {
                    _id: '$regionCode',
                    region: { $first: '$region' }
                }
            },
            {
                $project: {
                    regionCode: '$_id',
                    region: 1,
                    _id: 0
                }
            }
        ])
        .toArray()

    let success = 0
    let errors = 0

    for (const item of regions) {
        const polygons = JSON.parse(fs.readFileSync(`${appRoot}/data/regions.json`, 'utf8'))
        try {
            item.polygon = polygons.find((it: any) => it.id === item.regionCode)[0]
            success++
        } catch (e) {
            errors++
            logger.error(`err poly, id: ${item.id}, err: ${e.message}`)
        }
    }

    await regionsRepo.dropCollection()
    await regionsRepo.createCollection()
    await regionsRepo.collection.insertMany(regions)

    logger.info('regions updated')

    return { success, errors }
}
