"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const region_1 = require("../parameters/region");
class RegionInjectMiddleware {
    async use(context, next) {
        context.state.region = new region_1.Region(context.query);
        return next();
    }
}
exports.RegionInjectMiddleware = RegionInjectMiddleware;
