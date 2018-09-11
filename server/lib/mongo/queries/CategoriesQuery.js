"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class CategoriesQuery {
    constructor(search) {
        if (search) {
            this.$text = { $search: search };
        }
    }
}
exports.CategoriesQuery = CategoriesQuery;
