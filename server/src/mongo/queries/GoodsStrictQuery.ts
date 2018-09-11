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

    constructor(region: number, search?: string, categories?: number[], priceMin?: number, priceMax?: number) {
        if (search) {
            this.$text = { $search: search }
        }
        if (categories) {
            this.siteCatId = { $in: categories }
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
