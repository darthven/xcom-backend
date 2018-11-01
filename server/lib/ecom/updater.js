"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var EcomUpdater_1;
"use strict";
const appRoot = require("app-root-path");
const fs = require("fs");
const requestPromise = require("request-promise-native");
const typedi_1 = require("typedi");
const env_config_1 = require("../config/env.config");
const logger_config_1 = require("../config/logger.config");
const categories_1 = require("../mongo/repository/categories");
const goods_1 = require("../mongo/repository/goods");
const orderStatuses_1 = require("../mongo/repository/orderStatuses");
const payTypes_1 = require("../mongo/repository/payTypes");
const regions_1 = require("../mongo/repository/regions");
const stations_1 = require("../mongo/repository/stations");
const stores_1 = require("../mongo/repository/stores");
const storeType_1 = require("../mongo/repository/storeType");
const distanceByCoord_1 = require("../utils/distanceByCoord");
const fileExist_1 = require("../utils/fileExist");
const ftpUploader_1 = require("../utils/ftpUploader");
const imageSaver_1 = require("../utils/imageSaver");
const invalidGoodImages_1 = require("../utils/invalidGoodImages");
const storeTypesIcons_1 = require("../utils/storeTypesIcons");
const ecomOptions_1 = require("./ecomOptions");
let EcomUpdater = EcomUpdater_1 = class EcomUpdater {
    static makePrefixes(value) {
        const res = [];
        if (value) {
            value.split(' ').forEach((val) => {
                for (let i = 1; i < val.length; i++) {
                    res.push(val.substr(0, i).toUpperCase());
                }
            });
        }
        return res;
    }
    async updateCategories() {
        ecomOptions_1.ecomOptions.uri = `${env_config_1.ECOM_URL}/categories`;
        const res = await requestPromise(ecomOptions_1.ecomOptions);
        // SET IMAGE FOR CATEGORIES AND FIND PRODUCTS COUNT
        for (const item of res.categories) {
            const imgName = fileExist_1.categoryImageExist(item.id);
            if (imgName) {
                item.img = imgName;
            }
            item.productCount = await this.goods.collection.find({ siteCatId: item.id }).count();
        }
        // COUNT A TREE SUM USING PRODUCTS COUNT
        for (const item of res.categories) {
            item.treeSumCount = this.recursiveCategoryCount(res.categories, item.id);
            await this.categories.collection.updateOne({ id: item.id }, { $set: item }, { upsert: true });
        }
        logger_config_1.default.info('categories updated');
    }
    async updateStores() {
        ecomOptions_1.ecomOptions.uri = `${env_config_1.ECOM_URL}/stores`;
        const res = await requestPromise(ecomOptions_1.ecomOptions);
        for (const item of res.stores) {
            await this.stores.collection.updateOne({ id: item.id }, { $set: item }, { upsert: true });
        }
        logger_config_1.default.info('stores updated');
        const regions = await this.stores.collection
            .aggregate([
            {
                $project: {
                    _id: 0,
                    region: 1,
                    regionCode: 1
                }
            },
            {
                $group: {
                    _id: '$regionCode',
                    region: { $first: '$region' }
                }
            },
            {
                $project: {
                    regionCode: '$_id',
                    region: 1,
                    _id: 0
                }
            }
        ])
            .toArray();
        for (const item of regions) {
            await this.regions.collection.updateOne({ regionCode: item.regionCode }, { $set: item }, { upsert: true });
        }
        logger_config_1.default.info('regions updated');
    }
    async updateOrderStatuses() {
        ecomOptions_1.ecomOptions.uri = `${env_config_1.ECOM_URL}/order_statuses`;
        const res = await requestPromise(ecomOptions_1.ecomOptions);
        for (const item of res.orderStatuses) {
            await this.orderStatuses.collection.updateOne({ id: item.id }, { $set: item }, { upsert: true });
        }
        logger_config_1.default.info('order statuses uploaded');
    }
    async updatePayTypes() {
        ecomOptions_1.ecomOptions.uri = `${env_config_1.ECOM_URL}/pay_types`;
        const res = await requestPromise(ecomOptions_1.ecomOptions);
        for (const item of res.payTypes) {
            await this.payTypes.collection.updateOne({ id: item.id }, { $set: item }, { upsert: true });
        }
        logger_config_1.default.info('pay types updated');
    }
    async updateGoods() {
        for (let i = 1, count = 1; count; i++) {
            ecomOptions_1.ecomOptions.uri = `${env_config_1.ECOM_URL}/goods?page=${i}`;
            try {
                const res = await requestPromise(ecomOptions_1.ecomOptions);
                count = res.goodsCount;
                if (count) {
                    for (const item of res.goods) {
                        logger_config_1.default.debug(item.name);
                        item.suffixes = EcomUpdater_1.makePrefixes(item.name);
                        await this.updateSingleGood(item);
                    }
                }
                logger_config_1.default.info(`goods page ${i} updated`);
            }
            catch (err) {
                logger_config_1.default.error(`goods page ${i} failed`, { err: err.message, all: err });
            }
        }
        logger_config_1.default.info('goods updated');
    }
    async updateStocks() {
        const stores = await this.stores.collection.find().toArray();
        for (let i = 0; i < stores.length; i++) {
            ecomOptions_1.ecomOptions.uri = `${env_config_1.ECOM_URL}/stocks/${stores[i].id}`;
            try {
                logger_config_1.default.debug('request stock', { id: stores[i].id });
                const res = await requestPromise(ecomOptions_1.ecomOptions);
                await this.stores.collection.updateOne({ id: stores[i].id }, { $set: { stocks: res.stocks } });
            }
            catch (err) {
                logger_config_1.default.error(`${stores[i].id} didn't updated`, err.message);
            }
            logger_config_1.default.info(`${i + 1}/${stores.length} updated`);
        }
    }
    async updatePrices() {
        console.log('in');
        // const prices = await this.stores.getMinMax()
        // await this.goods.collection.updateMany({}, { $set: { price: null } })
        // for (const single of prices) {
        //     await this.goods.collection.updateOne({ id: single.id }, { $set: { price: single.price } })
        //     logger.debug(`${single.id} updated`)
        // }
        logger_config_1.default.info(`prices updated`);
    }
    async updateStoreLocations() {
        const stores = await this.stores.collection
            .find({})
            .project({ _id: 1, GPS: 1 })
            .toArray();
        for (const store of stores) {
            if (store.GPS) {
                let [lat, lng] = store.GPS.split(',');
                if (!lat || !lng) {
                    const [l1, l2] = store.GPS.split(';');
                    lat = l1;
                    lng = l2;
                }
                await this.stores.collection.updateOne({ _id: store._id }, {
                    $set: {
                        location: {
                            lat: parseFloat(lat),
                            lng: parseFloat(lng)
                        }
                    }
                });
            }
        }
        logger_config_1.default.info('store locations updated');
    }
    async updateStations() {
        const stations = JSON.parse(fs.readFileSync(`${appRoot}/data/stations.json`, 'utf8'));
        for (const item of stations) {
            await this.stations.collection.updateOne({ id: item.id }, { $set: item }, { upsert: true });
        }
    }
    async updateRegionsPoly() {
        const regions = JSON.parse(fs.readFileSync(`${appRoot}/data/regions.json`, 'utf8'));
        for (const item of regions) {
            try {
                await this.regions.collection.updateOne({ regionCode: item.id }, { $set: { polygon: item.polygon } });
            }
            catch (e) {
                logger_config_1.default.error(`err poly, id: ${item.id}, err: ${e.message}`);
            }
        }
        logger_config_1.default.info('regions poly updated');
    }
    async updateStoreTypes() {
        const types = await this.stores.getLocationsType();
        for (const item of types) {
            item.img = storeTypesIcons_1.storeTypesIconsMap.get(item.name);
            await this.storeTypes.collection.updateOne({ name: item.name }, { $set: item }, { upsert: true });
        }
        logger_config_1.default.info('store types updated');
    }
    async updateImages() {
        const goods = await this.goods.collection.find().toArray();
        for (const good of goods) {
            if (good.imgLinkFTP && !invalidGoodImages_1.invalidGoodImages.includes(good.id)) {
                await this.goods.updateImageLink(good.id);
            }
        }
    }
    async updateStationsNearStore() {
        const stores = await this.stores.collection
            .find({})
            .project({ _id: 0, id: 1, location: 1 })
            .toArray();
        const stations = await this.stations.collection
            .find({})
            .project({ _id: 0, location: 1, name: 1, id: 1, line: 1, city: 1 })
            .toArray();
        for (const store of stores) {
            if (!store.location) {
                continue;
            }
            // GET ALL STATION IN SOME RADIUS
            const stationsNear = distanceByCoord_1.getStationsInRadius(stations, store, 3);
            if (stationsNear.length) {
                await this.stores.collection.updateOne({ id: store.id }, {
                    $set: { stations: stationsNear }
                });
            }
        }
        logger_config_1.default.info('stations near stores updated updated');
    }
    recursiveCategoryCount(categories, parentId) {
        let sum = 0;
        for (const item of categories) {
            if (item.parentId === parentId) {
                sum += item.productCount + this.recursiveCategoryCount(categories, item.id);
            }
        }
        return sum;
    }
    async updateSingleGood(item) {
        const updated = await this.goods.collection.findOneAndUpdate({ id: item.id }, { $set: item }, { upsert: true });
        if (!updated.value) {
            // if new item added
            // update price
        }
        if (item.imgLinkFTP && !fileExist_1.goodImageExist(item.id)) {
            // upload image from ftp
            const tmpFile = await ftpUploader_1.uploadImage(item.imgLinkFTP);
            try {
                await imageSaver_1.saveGoodImage(tmpFile, item.id);
                await this.goods.updateImageLink(item.id);
            }
            catch (e) {
                logger_config_1.default.error('err while updating image', e.message);
            }
            logger_config_1.default.info(`image for good saved ${item.id}`);
        }
    }
};
__decorate([
    typedi_1.Inject(),
    __metadata("design:type", categories_1.CategoryRepository)
], EcomUpdater.prototype, "categories", void 0);
__decorate([
    typedi_1.Inject(),
    __metadata("design:type", stores_1.StoreRepository)
], EcomUpdater.prototype, "stores", void 0);
__decorate([
    typedi_1.Inject(),
    __metadata("design:type", orderStatuses_1.OrderStatusRepository)
], EcomUpdater.prototype, "orderStatuses", void 0);
__decorate([
    typedi_1.Inject(),
    __metadata("design:type", payTypes_1.PayTypeRepository)
], EcomUpdater.prototype, "payTypes", void 0);
__decorate([
    typedi_1.Inject(),
    __metadata("design:type", goods_1.GoodRepository)
], EcomUpdater.prototype, "goods", void 0);
__decorate([
    typedi_1.Inject(),
    __metadata("design:type", stations_1.StationsRepository)
], EcomUpdater.prototype, "stations", void 0);
__decorate([
    typedi_1.Inject(),
    __metadata("design:type", regions_1.RegionsRepository)
], EcomUpdater.prototype, "regions", void 0);
__decorate([
    typedi_1.Inject(),
    __metadata("design:type", storeType_1.StoreTypeRepository)
], EcomUpdater.prototype, "storeTypes", void 0);
EcomUpdater = EcomUpdater_1 = __decorate([
    typedi_1.Service()
], EcomUpdater);
exports.EcomUpdater = EcomUpdater;
