"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class GoodsStrictQuery {
    constructor(region, search, categories, priceMin, priceMax) {
        if (search) {
            this.$text = { $search: search };
        }
        if (categories) {
            this.siteCatId = { $in: categories };
        }
        if (priceMin || priceMax) {
            this.price = {
                $elemMatch: {
                    region,
                    priceMin: { $lt: priceMax || 1000000 },
                    priceMax: { $gt: priceMin || 0 }
                }
            };
        }
        else {
            this.price = { $elemMatch: { region } };
        }
    }
}
exports.GoodsStrictQuery = GoodsStrictQuery;
