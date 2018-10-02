export class GoodsNullQuery {
    public $text?: { $search: string }
    public siteCatId?: { $in: number[] }
    public price: null

    constructor(region: number, search?: string, categories?: number[]) {
        if (search) {
            this.$text = { $search: search }
        }
        if (categories) {
            this.siteCatId = { $in: categories }
        }
        this.price = null
    }
}
