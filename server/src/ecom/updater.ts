import * as requestPromise from 'request-promise-native'
import { Inject, Service } from 'typedi'

import { ECOM_URL } from '../config/env.config'
import logger from '../config/logger.config'
import { CategoryRepository } from '../mongo/repository/categories'
import { GoodRepository } from '../mongo/repository/goods'
import { OrderStatusRepository } from '../mongo/repository/orderStatuses'
import { PayTypeRepository } from '../mongo/repository/payTypes'
import { RegionsRepository } from '../mongo/repository/regions'
import { StockRepository } from '../mongo/repository/stocks'
import { StoreRepository } from '../mongo/repository/stores'
import { ecomOptions } from './ecomOptions'

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
    private stocks!: StockRepository
    @Inject()
    private regions!: RegionsRepository

    public async updateCategories(): Promise<void> {
        ecomOptions.uri = `${ECOM_URL}/categories`
        const res: any = await requestPromise(ecomOptions)
        for (const item of res.categories) {
            item.productCount = await this.goods.collection.find({ siteCatId: item.id }).count()
            await this.categories.collection.findOneAndUpdate({ id: item.id }, { $set: item }, { upsert: true })
        }
        logger.info('categories updated')
    }

    public async updateStores(): Promise<void> {
        ecomOptions.uri = `${ECOM_URL}/stores`
        const res: any = await requestPromise(ecomOptions)
        for (const item of res.stores) {
            await this.stores.collection.findOneAndUpdate({ id: item.id }, { $set: item }, { upsert: true })
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
            await this.regions.collection.findOneAndUpdate(
                { regionCode: item.regionCode },
                { $set: item },
                { upsert: true }
            )
        }
        logger.info('regions updated')
    }

    public async updateOrderStatuses(): Promise<void> {
        ecomOptions.uri = `${ECOM_URL}/order_statuses`
        const res: any = await requestPromise(ecomOptions)
        for (const item of res.orderStatuses) {
            await this.orderStatuses.collection.findOneAndUpdate({ id: item.id }, { $set: item }, { upsert: true })
        }
        logger.info('order statuses uploaded')
    }

    public async updatePayTypes(): Promise<void> {
        ecomOptions.uri = `${ECOM_URL}/pay_types`
        const res: any = await requestPromise(ecomOptions)
        for (const item of res.payTypes) {
            await this.payTypes.collection.findOneAndUpdate({ id: item.id }, { $set: item }, { upsert: true })
        }
        logger.info('pay types updated')
    }

    public async updateGoods(): Promise<void> {
        for (let i = 1, count = 1; count; i++) {
            ecomOptions.uri = `${ECOM_URL}/goods?page=${i}`
            try {
                const res: any = await requestPromise(ecomOptions)
                count = res.goodsCount
                if (count) {
                    for (const item of res.goods) {
                        await this.goods.collection.findOneAndUpdate({ id: item.id }, { $set: item }, { upsert: true })
                    }
                }
                logger.info(`goods page ${i} updated`)
            } catch (err) {
                logger.error(`goods page ${i} failed`, { message: err.message, all: err })
            }
        }
        logger.info('goods updated')
    }

    public async updateStocks(): Promise<void> {
        const stores: any[] = await this.stores.collection.find().toArray()
        for (let i = 0; i < stores.length; i++) {
            ecomOptions.uri = `${ECOM_URL}/stocks/${stores[i].id}`
            try {
                const res: any = await requestPromise(ecomOptions)
                for (const item of res.stocks) {
                    await this.stocks.collection.findOneAndUpdate(
                        { goodsId: item.goodsId, storeId: item.storeId },
                        { $set: item },
                        { upsert: true }
                    )
                }
            } catch (err) {
                logger.error(`${stores[i].id} didn't updated`, err.message)
            }
            logger.info(`${i + 1}/${stores.length} updated`)
        }
    }

    public async updatePrices(): Promise<void> {
        logger.debug(`started`)
        await this.goods.collection.updateMany({}, { $set: { price: null } })
        logger.debug(`finished`)
        const prices = await this.stores.getMinMax()
        for (const single of prices) {
            await this.goods.collection.updateOne({ id: single.id }, { $set: { price: single.price } })
            logger.debug(`${single.id} updated`)
        }
    }
    public async updateLocations(): Promise<void> {
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
                                lat,
                                lng
                            }
                        }
                    }
                )
            }
        }
    }
}
