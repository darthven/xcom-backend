"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class LocationsQuery {
    constructor(filter) {
        if (filter.type) {
            this.storeType = filter.type;
        }
        if (filter.region) {
            this.regionCode = filter.region;
        }
    }
}
exports.LocationsQuery = LocationsQuery;
