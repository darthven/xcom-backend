import * as requestPromise from 'request-promise-native'
import { Container } from 'typedi'
import { ECOM_URL } from '../config/env.config'
import logger from '../config/logger.config'
import { ecomOptions } from '../ecom/ecomOptions'
import { Category } from '../mongo/entity/category'
import { CategoryRepository } from '../mongo/repository/categories'
import { GoodRepository } from '../mongo/repository/goods'
import { categoryImageExist } from '../utils/fileExist'

/**
 * Before: updateGoods
 */
export default async () => {
    const goodsRepo = Container.get(GoodRepository)
    const categoriesRepo = Container.get(CategoryRepository)

    const res: any = await requestPromise({
        ...ecomOptions,
        uri: `${ECOM_URL}/categories`
    })

    // SET IMAGE FOR CATEGORIES AND FIND PRODUCTS COUNT
    for (const item of res.categories) {
        const imgName = categoryImageExist(item.id)
        if (imgName) {
            item.img = imgName
        }
        const updResult = await goodsRepo.collection.updateMany(
            { siteCatId: item.id },
            { $set: { categoryName: item.name } }
        )
        item.productCount = updResult.matchedCount
    }

    const ids = []
    let updated = 0

    // COUNT A TREE SUM USING PRODUCTS COUNT
    for (const item of res.categories) {
        ids.push(item.id)
        item.treeSumCount = recursiveCategoryCount(res.categories, item.id)
        await categoriesRepo.collection.updateOne({ id: item.id }, { $set: item }, { upsert: true })
        updated++
    }

    const del = await categoriesRepo.collection.deleteMany({ id: { $nin: ids } })

    logger.info('categories updated')
    return { updated, deleted: del.result.n || 0 }
}

const recursiveCategoryCount = (categories: Category[], parentId: number): number => {
    let sum = 0
    for (const item of categories) {
        if (item.parentId === parentId) {
            sum += item.productCount + recursiveCategoryCount(categories, item.id)
        }
    }
    return sum
}
