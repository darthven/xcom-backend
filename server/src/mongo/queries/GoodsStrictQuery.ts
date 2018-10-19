export class GoodsStrictQuery {
    public $text?: { $search: string }
    public siteCatId?: { $in: number[] }
    public price?:
        | {
              $elemMatch: {
                  region: number
                  priceMax: { $gt: number }
                  priceMin: { $lt: number }
              }
          }
        | { $elemMatch: { region: number } }
    public 'share.id'?: { $in: number[] }
    public 'share.endDate'?: { $gt: Date }
    public 'share.regions'?: { $in: number[] }

    constructor(
        region: number,
        search?: string,
        categories?: number[],
        priceMin?: number,
        priceMax?: number,
        shares?: number[]
    ) {
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
        if (priceMin || priceMax) {
            this.price = {
                $elemMatch: {
                    region,
                    priceMin: { $lt: priceMax || 1000000 },
                    priceMax: { $gt: priceMin || 0 }
                }
            }
        } else {
            this.price = { $elemMatch: { region } }
        }
    }
}
