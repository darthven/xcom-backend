import * as appRoot from 'app-root-path'
import * as fs from 'fs'
import * as requestPromise from 'request-promise-native'
import { Inject, Service } from 'typedi'

import { ECOM_URL } from '../config/env.config'
import logger from '../config/logger.config'
import { CategoryRepository } from '../mongo/repository/categories'
import { GoodRepository } from '../mongo/repository/goods'
import { RegionsRepository } from '../mongo/repository/regions'
import { StationsRepository } from '../mongo/repository/stations'
import { StoreRepository } from '../mongo/repository/stores'
import { StoreTypeRepository } from '../mongo/repository/storeTypes'
import { categoryImageExist } from '../utils/fileExist'
import { storeTypesIconsMap } from '../utils/storeTypesIcons'
import { ecomOptions } from './ecomOptions'
import { EcomUpdater } from './updater'

@Service()
export class EcomUploader {
    @Inject()
    private categories!: CategoryRepository
    @Inject()
    private stores!: StoreRepository
    @Inject()
    private goods!: GoodRepository
    @Inject()
    private stations!: StationsRepository
    @Inject()
    private regions!: RegionsRepository
    @Inject()
    private storeTypes!: StoreTypeRepository

    public async uploadCategories() {
        const res: any = await requestPromise({
            ...ecomOptions,
            uri: `${ECOM_URL}/categories`
        })
        await this.categories.dropCollection()
        await this.categories.createCollection()
        for (const single of res.categories) {
            const imgName = categoryImageExist(single.id)
            if (imgName) {
                single.img = imgName
            }
            single.productCount = await this.goods.collection.find({ siteCatId: single.id }).count()
            logger.debug(single.productCount)
        }
        await this.categories.collection.insertMany(res.categories)
        logger.info('categories uploaded')
    }

    public async uploadStores() {
        const res: any = await requestPromise({
            ...ecomOptions,
            uri: `${ECOM_URL}/stores`
        })
        await this.stores.dropCollection()
        await this.stores.createCollection()
        for (const single of res.stores) {
            try {
                await this.stores.collection.insertOne(single)
            } catch (e) {
                logger.debug(e.message)
            }
        }
        logger.info('stores uploaded')
    }

    public async uploadRegions() {
        const regions = await this.stores.getRegions()
        await this.regions.dropCollection()
        await this.regions.createCollection()
        await this.regions.collection.insertMany(regions)
        logger.info('regions uploaded')
    }

    public async uploadStoreTypes() {
        const types = await this.stores.getLocationsType()
        await this.storeTypes.dropCollection()
        await this.storeTypes.createCollection()
        for (const item of types) {
            item.img = storeTypesIconsMap.get(item.name)
        }
        await this.storeTypes.insertMany(types)
        logger.info('store types uploaded')
    }

    public async uploadGoods() {
        await this.goods.dropCollection()
        await this.goods.createCollection()
        for (let i = 1, count = 1; count; i++) {
            const res: any = await requestPromise({
                ...ecomOptions,
                uri: `${ECOM_URL}/goods?page=${i}`
            })
            count = res.goodsCount
            for (const single of res.goods) {
                try {
                    single.suffixes = EcomUpdater.makePrefixes(single.name)
                    await this.goods.collection.insertOne(single)
                } catch (e) {
                    // skip duplicated
                    logger.debug(e.message)
                }
            }
            logger.info(`goods page ${i} uploaded`)
        }
        logger.info('goods uploaded')
    }

    public async uploadStations() {
        await this.stations.dropCollection()
        await this.stations.createCollection()
        const stations = JSON.parse(fs.readFileSync(`${appRoot}/data/stations.json`, 'utf8'))
        await this.stations.collection.insertMany(stations)
    }
}
