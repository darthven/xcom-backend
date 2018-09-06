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
        const regions: any[] = await this.regions.collection.find().toArray()
        const limit = 100
        let skip = 0
        let query = 1
        for (let i = 0; query; i++) {
            const goods: any[] = await this.goods.collection
                .find()
                .limit(limit)
                .skip(skip)
                .toArray()
            query = goods.length
            skip = skip + limit
            for (const good of goods) {
                const price = []
                for (const region of regions) {
                    price.push(await this.goods.getMinMaxPrice(good.id, region.regionCode))
                }
                await this.goods.collection.findOneAndUpdate(
                    { id: good.id },
                    {
                        $set: {
                            price: price.filter(n => n)
                        }
                    }
                )
            }
            logger.debug('price updated', { skip })
        }
    }
}
