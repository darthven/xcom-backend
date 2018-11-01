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
const fileExist_1 = require("../utils/fileExist");
const ecomOptions_1 = require("./ecomOptions");
const updater_1 = require("./updater");
let EcomUploader = class EcomUploader {
    async uploadCategories() {
        ecomOptions_1.ecomOptions.uri = `${env_config_1.ECOM_URL}/categories`;
        const res = await requestPromise(ecomOptions_1.ecomOptions);
        await this.categories.dropCollection();
        await this.categories.createCollection();
        for (const single of res.categories) {
            const imgName = fileExist_1.categoryImageExist(single.id);
            if (imgName) {
                single.img = imgName;
            }
            single.productCount = await this.goods.collection.find({ siteCatId: single.id }).count();
            logger_config_1.default.debug(single.productCount);
        }
        await this.categories.collection.insertMany(res.categories);
        logger_config_1.default.info('categories uploaded');
    }
    async uploadStores() {
        ecomOptions_1.ecomOptions.uri = `${env_config_1.ECOM_URL}/stores`;
        const res = await requestPromise(ecomOptions_1.ecomOptions);
        await this.stores.dropCollection();
        await this.stores.createCollection();
        for (const single of res.stores) {
            try {
                await this.stores.collection.insertOne(single);
            }
            catch (e) {
                logger_config_1.default.debug(e.message);
            }
        }
        logger_config_1.default.info('stores uploaded');
    }
    async uploadRegions() {
        const regions = await this.stores.getRegions();
        await this.regions.dropCollection();
        await this.regions.createCollection();
        await this.regions.collection.insertMany(regions);
        logger_config_1.default.info('regions uploaded');
    }
    async uploadStoreTypes() {
        const types = await this.stores.getLocationsType();
        await this.storeTypes.dropCollection();
        await this.storeTypes.createCollection();
        await this.storeTypes.collection.insertMany(types);
        logger_config_1.default.info('store types uploaded');
    }
    async uploadOrderStatuses() {
        ecomOptions_1.ecomOptions.uri = `${env_config_1.ECOM_URL}/order_statuses`;
        const res = await requestPromise(ecomOptions_1.ecomOptions);
        await this.orderStatuses.dropCollection();
        await this.orderStatuses.createCollection();
        await this.orderStatuses.collection.insertMany(res.orderStatuses);
        logger_config_1.default.info('order statuses uploaded');
    }
    async uploadPayTypes() {
        ecomOptions_1.ecomOptions.uri = `${env_config_1.ECOM_URL}/pay_types`;
        const res = await requestPromise(ecomOptions_1.ecomOptions);
        await this.payTypes.dropCollection();
        await this.payTypes.createCollection();
        await this.payTypes.collection.insertMany(res.payTypes);
        logger_config_1.default.info('pay types uploaded');
    }
    async uploadGoods() {
        await this.goods.dropCollection();
        await this.goods.createCollection();
        for (let i = 1, count = 1; count; i++) {
            ecomOptions_1.ecomOptions.uri = `${env_config_1.ECOM_URL}/goods?page=${i}`;
            const res = await requestPromise(ecomOptions_1.ecomOptions);
            count = res.goodsCount;
            for (const single of res.goods) {
                try {
                    single.suffixes = updater_1.EcomUpdater.makePrefixes(single.name);
                    await this.goods.collection.insertOne(single);
                }
                catch (e) {
                    // skip duplicated
                    logger_config_1.default.debug(e.message);
                }
            }
            logger_config_1.default.info(`goods page ${i} uploaded`);
        }
        logger_config_1.default.info('goods uploaded');
    }
    async uploadStations() {
        await this.stations.dropCollection();
        await this.stations.createCollection();
        const stations = JSON.parse(fs.readFileSync(`${appRoot}/data/stations.json`, 'utf8'));
        await this.stations.collection.insertMany(stations);
    }
};
__decorate([
    typedi_1.Inject(),
    __metadata("design:type", categories_1.CategoryRepository)
], EcomUploader.prototype, "categories", void 0);
__decorate([
    typedi_1.Inject(),
    __metadata("design:type", stores_1.StoreRepository)
], EcomUploader.prototype, "stores", void 0);
__decorate([
    typedi_1.Inject(),
    __metadata("design:type", orderStatuses_1.OrderStatusRepository)
], EcomUploader.prototype, "orderStatuses", void 0);
__decorate([
    typedi_1.Inject(),
    __metadata("design:type", payTypes_1.PayTypeRepository)
], EcomUploader.prototype, "payTypes", void 0);
__decorate([
    typedi_1.Inject(),
    __metadata("design:type", goods_1.GoodRepository)
], EcomUploader.prototype, "goods", void 0);
__decorate([
    typedi_1.Inject(),
    __metadata("design:type", stations_1.StationsRepository)
], EcomUploader.prototype, "stations", void 0);
__decorate([
    typedi_1.Inject(),
    __metadata("design:type", regions_1.RegionsRepository)
], EcomUploader.prototype, "regions", void 0);
__decorate([
    typedi_1.Inject(),
    __metadata("design:type", storeType_1.StoreTypeRepository)
], EcomUploader.prototype, "storeTypes", void 0);
EcomUploader = __decorate([
    typedi_1.Service()
], EcomUploader);
exports.EcomUploader = EcomUploader;
