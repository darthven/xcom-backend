import * as appRoot from 'app-root-path'
import * as fs from 'fs'
import * as requestPromise from 'request-promise-native'
import { Inject, Service } from 'typedi'

import { ECOM_URL } from '../config/env.config'
import logger from '../config/logger.config'
import { Category } from '../mongo/entity/category'
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
import { StoreTypeRepository } from '../mongo/repository/storeTypes'
import { getStationsInRadius } from '../utils/distanceByCoord'
import { categoryImageExist, goodImageExist } from '../utils/fileExist'
import { uploadImage } from '../utils/ftpUploader'
import { saveGoodImage } from '../utils/imageSaver'
import { invalidGoodImages } from '../utils/invalidGoodImages'
import { storeTypesIconsMap } from '../utils/storeTypesIcons'
import { ecomOptions } from './ecomOptions'

@Service()
export class EcomUpdater {
    public static makePrefixes(value: string) {
        const res: string[] = []
        if (value) {
            value.split(' ').forEach((val: string) => {
                for (let i = 1; i < val.length; i++) {
                    res.push(val.substr(0, i).toUpperCase())
                }
            })
        }
        return res
    }
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
        const options = {
            ...ecomOptions,
            uri: `${ECOM_URL}/categories`
        }
        const res: any = await requestPromise(options)
        // SET IMAGE FOR CATEGORIES AND FIND PRODUCTS COUNT
        for (const item of res.categories) {
            const imgName = categoryImageExist(item.id)
            if (imgName) {
                item.img = imgName
            }
            item.productCount = await this.goods.collection.find({ siteCatId: item.id }).count()
        }
        // COUNT A TREE SUM USING PRODUCTS COUNT
        for (const item of res.categories) {
            item.treeSumCount = this.recursiveCategoryCount(res.categories, item.id)
            await this.categories.collection.updateOne({ id: item.id }, { $set: item }, { upsert: true })
        }
        logger.info('categories updated')
    }

    public async updateStores() {
        const options = {
            ...ecomOptions,
            uri: `${ECOM_URL}/stores`
        }
        const res: any = await requestPromise(options)
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
        const options = {
            ...ecomOptions,
            uri: `${ECOM_URL}/order_statuses`
        }
        const res: any = await requestPromise(options)
        for (const item of res.orderStatuses) {
            await this.orderStatuses.collection.updateOne({ id: item.id }, { $set: item }, { upsert: true })
        }
        logger.info('order statuses uploaded')
    }

    public async updatePayTypes() {
        const options = {
            ...ecomOptions,
            uri: `${ECOM_URL}/pay_types`
        }
        const res: any = await requestPromise(options)
        for (const item of res.payTypes) {
            await this.payTypes.collection.updateOne({ id: item.id }, { $set: item }, { upsert: true })
        }
        logger.info('pay types updated')
    }

    public async updateGoods() {
        for (let i = 1, count = 1; count; i++) {
            const options = {
                ...ecomOptions,
                uri: `${ECOM_URL}/goods?page=${i}`
            }
            try {
                const res: any = await requestPromise(options)
                count = res.goodsCount
                if (count) {
                    for (const item of res.goods) {
                        item.suffixes = EcomUpdater.makePrefixes(item.name)
                        await this.updateSingleGood(item)
                    }
                }
                logger.info(`goods page ${i} updated`)
            } catch (err) {
                logger.error(`goods page ${i} failed`, { err: err.message })
            }
        }
        logger.info('goods updated')
    }

    public async updateStocks() {
        const stores: any[] = await this.stores.collection.find().toArray()
        for (let i = 0; i < stores.length; i++) {
            const options = {
                ...ecomOptions,
                uri: `${ECOM_URL}/stocks/${stores[i].id}`
            }
            try {
                logger.debug('request stock', { id: stores[i].id })
                const res: any = await requestPromise(options)
                await this.stores.collection.updateOne({ id: stores[i].id }, { $set: { stocks: res.stocks } })
            } catch (err) {
                logger.error(`${stores[i].id} didn't updated`, err.message)
            }
            logger.info(`${i + 1}/${stores.length} updated`)
        }
    }

    public async updatePrices() {
        const prices = await this.stores.getMinMax()
        await this.goods.collection.updateMany({}, { $set: { price: null } })
        for (const single of prices) {
            await this.goods.collection.updateOne({ id: single.id }, { $set: { price: single.price } })
            logger.debug(`${single.id} updated`)
        }
        logger.info(`prices updated`)
    }
    public async updateStoreLocations() {
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
        logger.info('store locations updated')
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

    public async updateStationsNearStore() {
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
        logger.info('stations near stores updated updated')
    }

    private recursiveCategoryCount(categories: Category[], parentId: number): number {
        let sum = 0
        for (const item of categories) {
            if (item.parentId === parentId) {
                sum += item.productCount + this.recursiveCategoryCount(categories, item.id)
            }
        }
        return sum
    }

    private async updateSingleGood(item: Good) {
        const updated = await this.goods.collection.findOneAndUpdate({ id: item.id }, { $set: item }, { upsert: true })
        if (!updated.value) {
            // TODO update price
            // if new item added
            // update price
        }
        if (item.imgLinkFTP && !goodImageExist(item.id)) {
            // upload image from ftp
            try {
                const tmpFile = await uploadImage(item.imgLinkFTP)
                await saveGoodImage(tmpFile, item.id)
                await this.goods.updateImageLink(item.id)
                logger.info(`image for good saved ${item.id}`)
            } catch (e) {
                logger.error('err while updating image', { err: e.message })
            }
        }
    }
}
