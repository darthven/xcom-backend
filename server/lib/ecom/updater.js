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
const requestPromise = require("request-promise-native");
const typedi_1 = require("typedi");
const env_config_1 = require("../config/env.config");
const logger_config_1 = require("../config/logger.config");
const categories_1 = require("../mongo/repository/categories");
const goods_1 = require("../mongo/repository/goods");
const orderStatuses_1 = require("../mongo/repository/orderStatuses");
const payTypes_1 = require("../mongo/repository/payTypes");
const regions_1 = require("../mongo/repository/regions");
const stocks_1 = require("../mongo/repository/stocks");
const stores_1 = require("../mongo/repository/stores");
const ecomOptions_1 = require("./ecomOptions");
let EcomUpdater = class EcomUpdater {
    async updateCategories() {
        ecomOptions_1.ecomOptions.uri = `${env_config_1.ECOM_URL}/categories`;
        const res = await requestPromise(ecomOptions_1.ecomOptions);
        for (const item of res.categories) {
            item.productCount = await this.goods.collection.find({ siteCatId: item.id }).count();
            await this.categories.collection.findOneAndUpdate({ id: item.id }, { $set: item }, { upsert: true });
        }
        logger_config_1.default.info('categories updated');
    }
    async updateStores() {
        ecomOptions_1.ecomOptions.uri = `${env_config_1.ECOM_URL}/stores`;
        const res = await requestPromise(ecomOptions_1.ecomOptions);
        for (const item of res.stores) {
            await this.stores.collection.findOneAndUpdate({ id: item.id }, { $set: item }, { upsert: true });
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
            await this.regions.collection.findOneAndUpdate({ regionCode: item.regionCode }, { $set: item }, { upsert: true });
        }
        logger_config_1.default.info('regions updated');
    }
    async updateOrderStatuses() {
        ecomOptions_1.ecomOptions.uri = `${env_config_1.ECOM_URL}/order_statuses`;
        const res = await requestPromise(ecomOptions_1.ecomOptions);
        for (const item of res.orderStatuses) {
            await this.orderStatuses.collection.findOneAndUpdate({ id: item.id }, { $set: item }, { upsert: true });
        }
        logger_config_1.default.info('order statuses uploaded');
    }
    async updatePayTypes() {
        ecomOptions_1.ecomOptions.uri = `${env_config_1.ECOM_URL}/pay_types`;
        const res = await requestPromise(ecomOptions_1.ecomOptions);
        for (const item of res.payTypes) {
            await this.payTypes.collection.findOneAndUpdate({ id: item.id }, { $set: item }, { upsert: true });
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
                        await this.goods.collection.findOneAndUpdate({ id: item.id }, { $set: item }, { upsert: true });
                    }
                }
                logger_config_1.default.info(`goods page ${i} updated`);
            }
            catch (err) {
                logger_config_1.default.error(`goods page ${i} failed`, { message: err.message, all: err });
            }
        }
        logger_config_1.default.info('goods updated');
    }
    async updateStocks() {
        const stores = await this.stores.collection.find().toArray();
        for (let i = 0; i < stores.length; i++) {
            ecomOptions_1.ecomOptions.uri = `${env_config_1.ECOM_URL}/stocks/${stores[i].id}`;
            try {
                const res = await requestPromise(ecomOptions_1.ecomOptions);
                for (const item of res.stocks) {
                    await this.stocks.collection.findOneAndUpdate({ goodsId: item.goodsId, storeId: item.storeId }, { $set: item }, { upsert: true });
                }
            }
            catch (err) {
                logger_config_1.default.error(`${stores[i].id} didn't updated`, err.message);
            }
            logger_config_1.default.info(`${i + 1}/${stores.length} updated`);
        }
    }
    async updatePrices() {
        const goods = await this.goods.collection.find().toArray();
        for (const single of goods) {
            await this.goods.collection.updateOne({ id: single.id }, { $set: { price: null } });
        }
        const prices = await this.stores.getMinMax();
        for (const single of prices) {
            await this.goods.collection.updateOne({ id: single.id }, { $set: { price: single.price } });
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
    __metadata("design:type", stocks_1.StockRepository)
], EcomUpdater.prototype, "stocks", void 0);
__decorate([
    typedi_1.Inject(),
    __metadata("design:type", regions_1.RegionsRepository)
], EcomUpdater.prototype, "regions", void 0);
EcomUpdater = __decorate([
    typedi_1.Service()
], EcomUpdater);
exports.EcomUpdater = EcomUpdater;
