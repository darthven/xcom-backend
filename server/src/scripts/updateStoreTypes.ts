import { Container } from 'typedi'
import logger from '../config/logger.config'
import { StoreRepository } from '../mongo/repository/stores'
import { StoreTypeRepository } from '../mongo/repository/storeTypes'
import { storeTypesIconsMap } from '../utils/storeTypesIcons'

/**
 * Before: updateStores
 */
export default async () => {
    const storesRepo = Container.get(StoreRepository)
    const storeTypesRepo = Container.get(StoreTypeRepository)

    const types = await storesRepo.getLocationsType()
    for (const item of types) {
        item.img = storeTypesIconsMap.get(item.name)
    }

    await storeTypesRepo.dropCollection()
    await storeTypesRepo.createCollection()
    await storeTypesRepo.insertMany(types)
    logger.info('store types updated')
    return { updated: types.length }
}
