"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const locationFilter_1 = require("../parameters/locationFilter");
class LocationFilterInjectMiddleware {
    async use(context, next) {
        context.state.locationFilter = new locationFilter_1.LocationFilter(context.query);
        return next();
    }
}
exports.LocationFilterInjectMiddleware = LocationFilterInjectMiddleware;
