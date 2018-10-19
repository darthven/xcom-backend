export class GoodsNullQuery {
    public $text?: { $search: string }
    public siteCatId?: { $in: number[] }
    public price: null
    public 'share.id'?: { $in: number[] }
    public 'share.endDate'?: { $gt: Date }
    public 'share.regions'?: { $in: number[] }

    constructor(region: number, search?: string, categories?: number[], shares?: number[]) {
        if (search) {
            this.$text = { $search: search }
        }
        if (categories) {
            this.siteCatId = { $in: categories }
        }
        if (shares) {
            this['share.id'] = { $in: shares }
            this['share.endDate'] = { $gt: new Date() }
        }
        this.price = null
    }
}
