import { ProductFilter } from '../../parameters/productFilter'

type RegionFilter = [{ 'share.regions': { $exists: true; $eq: null } }, { 'share.regions': number }]

export class GoodsFilter {
    public siteCatId?: { $in: number[] }
    public price?: any
    public 'share.id'?: { $in: number[] }
    public 'share.endDate'?: { $gt: Date }
    public $or?: RegionFilter

    constructor(region: number, filter: ProductFilter) {
        if (filter.categories) {
            this.siteCatId = { $in: filter.categories }
        }
        if (filter.shares) {
            this['share.id'] = { $in: filter.shares }
            this['share.endDate'] = { $gt: new Date() }
        }
        this.$or = [{ 'share.regions': { $exists: true, $eq: null } }, { 'share.regions': region }]
        this.price = {
            $elemMatch: {
                region
            }
        }
        if (filter.inStock && filter.storeIds) {
            this.price.$elemMatch = {
                stores: { $in: filter.storeIds }
            }
        }
        if (filter.priceMin || filter.priceMax) {
            this.price = this.price || { $elemMatch: {} }
            this.price.$elemMatch.region = region
            this.price.$elemMatch.priceMin = { $lt: filter.priceMax || 1000000 }
            this.price.$elemMatch.priceMax = { $gt: filter.priceMin || 0 }
        }
    }
}
