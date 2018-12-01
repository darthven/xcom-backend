import { ProductFilter } from '../../parameters/productFilter'
import { GoodsQuery } from './GoodsQuery'

export class GoodsNullQuery extends GoodsQuery {
    constructor(region: number, filter: ProductFilter) {
        super(region, filter)
        this.price = null
    }
}
