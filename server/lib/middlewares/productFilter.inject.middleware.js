"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const productFilter_1 = require("../parameters/productFilter");
class ProductFilterInjectMiddleware {
    async use(context, next) {
        context.state.productFilter = new productFilter_1.ProductFilter(context.query);
        return next();
    }
}
exports.ProductFilterInjectMiddleware = ProductFilterInjectMiddleware;
