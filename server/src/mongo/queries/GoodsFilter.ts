import { ProductFilter } from '../../parameters/productFilter'

export class GoodsFilter {
    public siteCatId?: { $in: number[] }
    public price?: any
    public 'share.id'?: { $in: number[] }
    public 'share.endDate'?: { $gt: Date }
    public 'share.regions'?: { $in: number[] }

    constructor(region: number, filter: ProductFilter) {
        if (filter.categories) {
            this.siteCatId = { $in: filter.categories }
        }
        if (filter.shares) {
            this['share.id'] = { $in: filter.shares }
            this['share.endDate'] = { $gt: new Date() }
        }
        if (filter.priceMin || filter.priceMax) {
            this.price = {
                $elemMatch: {
                    region,
                    priceMin: { $lt: filter.priceMax || 1000000 },
                    priceMax: { $gt: filter.priceMin || 0 }
                }
            }
        } else {
            this.price = { $elemMatch: { region } }
        }
    }
}
