import { Container } from 'typedi'
import logger from '../config/logger.config'
import { GoodRepository } from '../mongo/repository/goods'
import { Price, StocksRepository } from '../mongo/repository/stocks'

/**
 * Before: updateGoods, updateStocks
 */
export default async () => {
    const stocksRepo = Container.get(StocksRepository)
    const goodsRepo = Container.get(GoodRepository)

    const pricesCursor = await stocksRepo.getMinMaxCursor()
    let updated = 0

    const updatedGoods = new Set()

    while (await pricesCursor.hasNext()) {
        const good: { id: number; price: Price } = (await pricesCursor.next())!
        updatedGoods.add(good.id)
        await goodsRepo.collection.updateOne({ id: good.id }, { $set: { price: good.price } })
        logger.debug(`updatePricesIndex: price for ${good.id} updated`)
        updated++
    }

    // set null prices to all goods that don't have stocks
    const res = await goodsRepo.collection.updateMany(
        { id: { $nin: Array.from(updatedGoods) } },
        { $set: { price: null } }
    )

    logger.info(`prices updated`)
    return { updated, nulled: res.modifiedCount }
}
