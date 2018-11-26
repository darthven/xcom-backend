import { Container } from 'typedi'
import logger from '../config/logger.config'
import { Station } from '../mongo/entity/station'
import { Store } from '../mongo/entity/store'
import { StationsRepository } from '../mongo/repository/stations'
import { StoreRepository } from '../mongo/repository/stores'
import { getStationsInRadius } from '../utils/distanceByCoord'

/**
 * Before: updateStores, updateStations
 */
export default async () => {
    const storesRepo = Container.get(StoreRepository)
    const stationsRepo = Container.get(StationsRepository)

    let noLocation = 0
    let updated = 0

    const stores: Store[] = await storesRepo.collection
        .find({})
        .project({ _id: 0, id: 1, location: 1 })
        .toArray()
    const stations: Station[] = await stationsRepo.collection
        .find({})
        .project({ _id: 0, location: 1, name: 1, id: 1, line: 1, city: 1 })
        .toArray()
    for (const store of stores) {
        if (!store.location) {
            noLocation++
            continue
        }
        // GET ALL STATION IN SOME RADIUS
        const stationsNear = getStationsInRadius(stations, store, 3)
        if (stationsNear.length) {
            await storesRepo.collection.updateOne(
                { id: store.id },
                {
                    $set: { stations: stationsNear }
                }
            )
            updated++
        }
    }
    logger.info('stations near stores updated updated')
    return { noLocation, updated }
}
