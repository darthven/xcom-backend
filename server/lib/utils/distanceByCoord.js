"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const store_1 = require("../mongo/entity/store");
function distanceByCoord(lat1, lon1, lat2, lon2, unit) {
    const radlat1 = (Math.PI * lat1) / 180;
    const radlat2 = (Math.PI * lat2) / 180;
    const theta = lon1 - lon2;
    const radtheta = (Math.PI * theta) / 180;
    let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    if (dist > 1) {
        dist = 1;
    }
    dist = Math.acos(dist);
    dist = (dist * 180) / Math.PI;
    dist = dist * 60 * 1.1515;
    if (unit === 'K') {
        dist = dist * 1.609344;
    }
    if (unit === 'N') {
        dist = dist * 0.8684;
    }
    return dist;
}
function getStationsInRadius(stations, store, radius) {
    const res = [];
    for (const station of stations) {
        const distance = distanceByCoord(store.location.lat, store.location.lng, station.location.lat, station.location.lng, 'K');
        if (distance > radius) {
            continue;
        }
        res.push(new store_1.StoreStation(station, distance));
    }
    return res;
}
exports.getStationsInRadius = getStationsInRadius;
