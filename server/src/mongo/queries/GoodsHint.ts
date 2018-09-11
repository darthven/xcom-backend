export class GoodsHint {
    public hint?: string

    constructor(priceMin?: number, priceMax?: number, query?: string) {
        if (!query) {
            if (priceMin && priceMax) {
                this.hint = 'priceMinMaxReg'
            } else if (priceMin) {
                this.hint = 'priceMinReg'
            } else if (priceMax) {
                this.hint = 'priceMaxReg'
            } else {
                this.hint = 'priceReg'
            }
        }
    }
}
