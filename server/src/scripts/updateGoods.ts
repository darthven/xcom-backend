import * as requestPromise from 'request-promise-native'
import { Container } from 'typedi'
import { ECOM_URL } from '../config/env.config'
import logger from '../config/logger.config'
import { ecomOptions } from '../ecom/ecomOptions'
import { GoodRepository } from '../mongo/repository/goods'

export default async () => {
    const goodsRepo = Container.get(GoodRepository)
    await goodsRepo.createCollection()

    let updated = 0
    let inserted = 0

    const ids = []

    for (let i = 1, count = 1; count; i++) {
        try {
            const res: any = await requestPromise({
                ...ecomOptions,
                uri: `${ECOM_URL}/goods?page=${i}`
            })
            count = res.goodsCount
            if (count) {
                for (const item of res.goods) {
                    ids.push(item.id)
                    item.searchKeywords = [].concat(
                        ...(item.name || '').toLocaleLowerCase().split(' '),
                        ...(item.mnn || '').toLocaleLowerCase().split(' '),
                        ...(item.manufacturer || '').toLocaleLowerCase().split(' '),
                        ...(item.tradeMark || '').toLocaleLowerCase().split(' '),
                        ...(item.tradeName || '').toLocaleLowerCase().split(' ')
                    )
                    const upd = await goodsRepo.collection.findOneAndUpdate(
                        { id: item.id },
                        { $set: item },
                        { upsert: true }
                    )
                    if (!upd.value) {
                        inserted++
                        // TODO update price
                        // if new item added
                        // update price
                    } else {
                        updated++
                    }
                    logger.debug(`goods ${item.id} updated`, item)
                }
            }
            logger.debug(`goods page ${i}/${res.pageCount} updated`)
        } catch (err) {
            logger.error(`goods page ${i} failed`, { err: err.message })
        }
    }

    const del = await goodsRepo.collection.deleteMany({ id: { $nin: ids } })

    logger.info('goods updated')
    return { updated, inserted, deleted: del.result.n || 0 }
}
