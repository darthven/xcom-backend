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
export class EcomUploader {
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

    public async uploadCategories(): Promise<void> {
        ecomOptions.uri = `${ECOM_URL}/categories`
        const res: any = await requestPromise(ecomOptions)
        await this.categories.dropCollection()
        await this.categories.createCollection()
        for (let i = 0; i < res.categories.length; i++) {
            res.categories[i].productCount = await this.goods.collection
                .find({ siteCatId: res.categories[i].id })
                .count()
            logger.debug(res.categories[i].productCount)
        }
        await this.categories.collection.insertMany(res.categories)
        logger.info('categories uploaded')
    }

    public async uploadStores(): Promise<void> {
        ecomOptions.uri = `${ECOM_URL}/stores`
        const res: any = await requestPromise(ecomOptions)
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
        await this.regions.dropCollection()
        await this.regions.createCollection()
        await this.regions.collection.insertMany(regions)
        logger.info('regions uploaded')
    }

    public async uploadOrderStatuses(): Promise<void> {
        ecomOptions.uri = `${ECOM_URL}/order_statuses`
        const res: any = await requestPromise(ecomOptions)
        await this.orderStatuses.dropCollection()
        await this.orderStatuses.createCollection()
        await this.orderStatuses.collection.insertMany(res.orderStatuses)
        logger.info('order statuses uploaded')
    }

    public async uploadPayTypes(): Promise<void> {
        ecomOptions.uri = `${ECOM_URL}/pay_types`
        const res: any = await requestPromise(ecomOptions)
        await this.payTypes.dropCollection()
        await this.payTypes.createCollection()
        await this.payTypes.collection.insertMany(res.payTypes)
        logger.info('pay types uploaded')
    }

    public async uploadGoods(): Promise<void> {
        await this.goods.dropCollection()
        await this.goods.createCollection()
        for (let i = 1, count = 1; count; i++) {
            ecomOptions.uri = `${ECOM_URL}/goods?page=${i}`
            const res: any = await requestPromise(ecomOptions)
            count = res.goodsCount
            for (const single of res.goods) {
                try {
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

    public async uploadStocks(): Promise<void> {
        await this.stocks.dropCollection()
        await this.stocks.createCollection()
        const stores: any[] = await this.stores.collection.find().toArray()
        for (let i = 0; i < stores.length; i++) {
            ecomOptions.uri = `${ECOM_URL}/stocks/${stores[i].id}`
            try {
                const res: any = await requestPromise(ecomOptions)
                await this.stocks.collection.insertMany(res.stocks)
            } catch (err) {
                logger.error(`${stores[i].id} didn't uploaded`, err.measure)
            }
            logger.info(`${i + 1}/${stores.length} uploaded`)
        }
    }
}
