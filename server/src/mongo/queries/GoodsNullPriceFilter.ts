import { ProductFilter } from '../../parameters/productFilter'
import { GoodsFilter } from './GoodsFilter'

export class GoodsNullPriceFilter extends GoodsFilter {
    constructor(region: number, filter: ProductFilter) {
        super(region, filter)
        this.price = null
    }
}
