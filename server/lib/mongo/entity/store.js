"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class StoreStation {
    constructor(station, distance) {
        this.id = station.id;
        this.name = station.name;
        this.location = station.location;
        this.distance = distance;
        this.city = station.city;
        this.line = station.line;
    }
}
exports.StoreStation = StoreStation;
