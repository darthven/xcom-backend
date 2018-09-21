import * as appRoot from 'app-root-path'
import * as fs from 'fs'
import * as requestPromise from 'request-promise-native'
import { Inject, Service } from 'typedi'

import { ECOM_URL, IMAGE_DEFAULT_TYPE } from '../config/env.config'
import logger from '../config/logger.config'
import { Good } from '../mongo/entity/good'
import { Station } from '../mongo/entity/station'
import { Store } from '../mongo/entity/store'
import { CategoryRepository } from '../mongo/repository/categories'
import { GoodRepository } from '../mongo/repository/goods'
import { OrderStatusRepository } from '../mongo/repository/orderStatuses'
import { PayTypeRepository } from '../mongo/repository/payTypes'
import { RegionsRepository } from '../mongo/repository/regions'
import { StationsRepository } from '../mongo/repository/stations'
import { StoreRepository } from '../mongo/repository/stores'
import { StoreTypeRepository } from '../mongo/repository/storeType'
import { getStationsInRadius } from '../utils/distanceByCoord'
import { goodImageExist } from '../utils/fileExist'
import { invalidGoodImages } from '../utils/invalidGoodImages'
import { storeTypesIconsMap } from '../utils/storeTypesIcons'
import { ecomOptions } from './ecomOptions'
import {uploadImage} from '../utils/ftpUploader'
import {saveGoodImage} from '../utils/imageSaver'

@Service()
export class EcomUpdater {
    @Inject()
    private categories!: CategoryRepository
    @Inject()
    private stores!: StoreRepository
    @Inject()
    private orderStatuses!: OrderStatusRepository
    @Inject()
    private payTypes!: PayTypeRepository
    @Inject()
    private goods!: GoodRepository
    @Inject()
    private stations!: StationsRepository
    @Inject()
    private regions!: RegionsRepository
    @Inject()
    private storeTypes!: StoreTypeRepository

    public async updateCategories() {
        ecomOptions.uri = `${ECOM_URL}/categories`
        const res: any = await requestPromise(ecomOptions)
        for (const item of res.categories) {
            item.productCount = await this.goods.collection.find({ siteCatId: item.id }).count()
            await this.categories.collection.updateOne({ id: item.id }, { $set: item }, { upsert: true })
        }
        logger.info('categories updated')
    }

    public async updateStores() {
        ecomOptions.uri = `${ECOM_URL}/stores`
        const res: any = await requestPromise(ecomOptions)
        for (const item of res.stores) {
            await this.stores.collection.updateOne({ id: item.id }, { $set: item }, { upsert: true })
        }
        logger.info('stores updated')
        const regions = await this.stores.collection
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
        for (const item of regions) {
            await this.regions.collection.updateOne({ regionCode: item.regionCode }, { $set: item }, { upsert: true })
        }
        logger.info('regions updated')
    }

    public async updateOrderStatuses() {
        ecomOptions.uri = `${ECOM_URL}/order_statuses`
        const res: any = await requestPromise(ecomOptions)
        for (const item of res.orderStatuses) {
            await this.orderStatuses.collection.updateOne({ id: item.id }, { $set: item }, { upsert: true })
        }
        logger.info('order statuses uploaded')
    }

    public async updatePayTypes() {
        ecomOptions.uri = `${ECOM_URL}/pay_types`
        const res: any = await requestPromise(ecomOptions)
        for (const item of res.payTypes) {
            await this.payTypes.collection.updateOne({ id: item.id }, { $set: item }, { upsert: true })
        }
        logger.info('pay types updated')
    }

    public async updateGoods() {
        for (let i = 1, count = 1; count; i++) {
            ecomOptions.uri = `${ECOM_URL}/goods?page=${i}`
            try {
                const res: any = await requestPromise(ecomOptions)
                count = res.goodsCount
                if (count) {
                    for (const item of res.goods) {
                        await this.updateSingleGood(item)
                    }
                }
                logger.info(`goods page ${i} updated`)
            } catch (err) {
                logger.error(`goods page ${i} failed`, { message: err.message, all: err })
            }
        }
        logger.info('goods updated')
    }

    public async updateStocks() {
        const stores: any[] = await this.stores.collection.find().toArray()
        for (let i = 0; i < stores.length; i++) {
            ecomOptions.uri = `${ECOM_URL}/stocks/${stores[i].id}`
            try {
                logger.debug('request stock', { id: stores[i].id })
                const res: any = await requestPromise(ecomOptions)
                await this.stores.collection.updateOne({ id: stores[i].id }, { $set: { stocks: res.stocks } })
            } catch (err) {
                logger.error(`${stores[i].id} didn't updated`, err.message)
            }
            logger.info(`${i + 1}/${stores.length} updated`)
        }
    }

    public async updatePrices() {
        logger.debug(`started`)
        await this.goods.collection.updateMany({}, { $set: { price: null } })
        logger.debug(`finished`)
        const prices = await this.stores.getMinMax()
        for (const single of prices) {
            await this.goods.collection.updateOne({ id: single.id }, { $set: { price: single.price } })
            logger.debug(`${single.id} updated`)
        }
    }
    public async updateLocations() {
        const stores = await this.stores.collection
            .find({})
            .project({ _id: 1, GPS: 1 })
            .toArray()
        for (const store of stores) {
            if (store.GPS) {
                let [lat, lng] = store.GPS.split(',')
                if (!lat || !lng) {
                    const [l1, l2] = store.GPS.split(';')
                    lat = l1
                    lng = l2
                }
                await this.stores.collection.updateOne(
                    { _id: store._id },
                    {
                        $set: {
                            location: {
                                lat: parseFloat(lat),
                                lng: parseFloat(lng)
                            }
                        }
                    }
                )
            }
        }
    }

    public async updateStations() {
        const stations: Station[] = JSON.parse(fs.readFileSync(`${appRoot}/data/stations.json`, 'utf8'))
        for (const item of stations) {
            await this.stations.collection.updateOne({ id: item.id }, { $set: item }, { upsert: true })
        }
    }

    public async updateRegionsPoly() {
        const regions = JSON.parse(fs.readFileSync(`${appRoot}/data/regions.json`, 'utf8'))
        for (const item of regions) {
            try {
                await this.regions.collection.updateOne({ regionCode: item.id }, { $set: { polygon: item.polygon } })
            } catch (e) {
                logger.error(`err poly, id: ${item.id}, err: ${e.message}`)
            }
        }
        logger.info('regions poly updated')
    }

    public async updateStoreTypes() {
        const types = await this.stores.getLocationsType()
        for (const item of types) {
            item.img = storeTypesIconsMap.get(item.name)
            await this.storeTypes.collection.updateOne({ name: item.name }, { $set: item }, { upsert: true })
        }
        logger.info('store types updated')
    }

    public async updateImages() {
        const goods: Good[] = await this.goods.collection.find().toArray()
        for (const good of goods) {
            if (good.imgLinkFTP && !invalidGoodImages.includes(good.id)) {
                await this.goods.updateImageLink(good.id)
            }
        }
    }

    public async updateStationsNear() {
        const stores: Store[] = await this.stores.collection
            .find({})
            .project({ _id: 0, id: 1, location: 1 })
            .toArray()
        const stations: Station[] = await this.stations.collection
            .find({})
            .project({ _id: 0, location: 1, name: 1, id: 1, line: 1, city: 1 })
            .toArray()
        for (const store of stores) {
            if (!store.location) {
                continue
            }
            // GET ALL STATION IN SOME RADIUS
            const stationsNear = getStationsInRadius(stations, store, 3)
            if (stationsNear.length) {
                await this.stores.collection.updateOne(
                    { id: store.id },
                    {
                        $set: { stations: stationsNear }
                    }
                )
            }
        }
    }

    private async updateSingleGood(item: Good) {
        const updated = await this.goods.collection.findOneAndUpdate({ id: item.id }, { $set: item }, { upsert: true })
        if (!updated.value) {
            // if new item added
            // update price
        }
        if (item.imgLinkFTP && !goodImageExist(item.id)) {
            const tmpFile = await uploadImage(item.imgLinkFTP)
            try {
                await saveGoodImage(tmpFile, item.id)
                await this.goods.updateImageLink(item.id)
            } catch (e) {
                logger.error('err while updating image', e.message)
            }
            logger.info(`image for good saved ${item.id}`)
        }
    }
}
