"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class GoodsNullQuery {
    constructor(region, search, categories, shares) {
        if (search) {
            this.$text = { $search: search };
        }
        if (categories) {
            this.siteCatId = { $in: categories };
        }
        if (shares) {
            this['share.id'] = { $in: shares };
            this['share.endDate'] = { $gt: new Date() };
        }
        this.price = null;
    }
}
exports.GoodsNullQuery = GoodsNullQuery;
