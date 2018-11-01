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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const routing_controllers_1 = require("routing-controllers");
const typedi_1 = require("typedi");
const ids_inject_middleware_1 = require("../middlewares/ids.inject.middleware");
const productFilter_inject_middleware_1 = require("../middlewares/productFilter.inject.middleware");
const region_inject_middleware_1 = require("../middlewares/region.inject.middleware");
const skipTake_inject_middleware_1 = require("../middlewares/skipTake.inject.middleware");
const GoodsHint_1 = require("../mongo/queries/GoodsHint");
const GoodsNullQuery_1 = require("../mongo/queries/GoodsNullQuery");
const GoodsSort_1 = require("../mongo/queries/GoodsSort");
const GoodsStrictQuery_1 = require("../mongo/queries/GoodsStrictQuery");
const goods_1 = require("../mongo/repository/goods");
const ids_1 = require("../parameters/ids");
const productFilter_1 = require("../parameters/productFilter");
const region_1 = require("../parameters/region");
const skipTake_1 = require("../parameters/skipTake");
let GoodsController = class GoodsController {
    async getGoods(skipTake, region, filter) {
        const sort = new GoodsSort_1.GoodsSort(filter.sort, filter.order);
        const hint = new GoodsHint_1.GoodsHint(filter.priceMin, filter.priceMax, filter.query);
        const withoutPriceMatch = new GoodsNullQuery_1.GoodsNullQuery(region.region, filter.query, filter.categories, filter.shares);
        const withPriceMatch = new GoodsStrictQuery_1.GoodsStrictQuery(region.region, filter.query, filter.categories, filter.priceMin, filter.priceMax, filter.shares);
        const all = this.goods.getAll(withPriceMatch, withoutPriceMatch, skipTake, region, sort, hint);
        const categories = this.goods.getCategories(withPriceMatch, hint);
        const price = await this.goods.getMinMaxPrice(withPriceMatch, region, hint);
        const density = this.goods.getDensity(withPriceMatch, region, hint, price.max);
        const res = await all;
        return {
            length: res.fullLength,
            categories: await categories,
            density: await density,
            price,
            data: res.data
        };
    }
    async getGoodsData(skipTake, region, filter) {
        const sort = new GoodsSort_1.GoodsSort(filter.sort, filter.order);
        const hint = new GoodsHint_1.GoodsHint(filter.priceMin, filter.priceMax, filter.query);
        const withoutPriceMatch = new GoodsNullQuery_1.GoodsNullQuery(region.region, filter.query, filter.categories, filter.shares);
        const withPriceMatch = new GoodsStrictQuery_1.GoodsStrictQuery(region.region, filter.query, filter.categories, filter.priceMin, filter.priceMax, filter.shares);
        const res = await this.goods.getAll(withPriceMatch, withoutPriceMatch, skipTake, region, sort, hint);
        return {
            length: res.fullLength,
            data: res.data
        };
    }
    async getGoodsInfo(skipTake, region, filter) {
        const hint = new GoodsHint_1.GoodsHint(filter.priceMin, filter.priceMax, filter.query);
        const withPriceMatch = new GoodsStrictQuery_1.GoodsStrictQuery(region.region, filter.query, filter.categories, filter.priceMin, filter.priceMax, filter.shares);
        const length = this.goods.getLength(withPriceMatch, hint);
        const categories = this.goods.getCategories(withPriceMatch, hint);
        const price = await this.goods.getMinMaxPrice(withPriceMatch, region, hint);
        const density = this.goods.getDensity(withPriceMatch, region, hint, price.max);
        return {
            length: await length,
            categories: await categories,
            density: await density,
            price
        };
    }
    async getGoodsByBarcode(id, region) {
        return this.goods.getByBarcode(id, region);
    }
    async getSingle(id, region) {
        const res = await this.goods.getSingle(id, region);
        if (!res || !res[0]) {
            throw new routing_controllers_1.NotFoundError('good not found');
        }
        return res[0];
    }
    async getGoodsByIds(ids, region) {
        return this.goods.getByIds(ids.value, region);
    }
};
__decorate([
    typedi_1.Inject(),
    __metadata("design:type", goods_1.GoodRepository)
], GoodsController.prototype, "goods", void 0);
__decorate([
    routing_controllers_1.Get(),
    routing_controllers_1.UseBefore(skipTake_inject_middleware_1.SkipTakeInjectMiddleware),
    routing_controllers_1.UseBefore(region_inject_middleware_1.RegionInjectMiddleware),
    routing_controllers_1.UseBefore(productFilter_inject_middleware_1.ProductFilterInjectMiddleware),
    __param(0, routing_controllers_1.State('skipTake')),
    __param(1, routing_controllers_1.State('region')),
    __param(2, routing_controllers_1.State('productFilter')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [skipTake_1.SkipTake,
        region_1.Region,
        productFilter_1.ProductFilter]),
    __metadata("design:returntype", Promise)
], GoodsController.prototype, "getGoods", null);
__decorate([
    routing_controllers_1.Get('/get/data'),
    routing_controllers_1.UseBefore(skipTake_inject_middleware_1.SkipTakeInjectMiddleware),
    routing_controllers_1.UseBefore(region_inject_middleware_1.RegionInjectMiddleware),
    routing_controllers_1.UseBefore(productFilter_inject_middleware_1.ProductFilterInjectMiddleware),
    __param(0, routing_controllers_1.State('skipTake')),
    __param(1, routing_controllers_1.State('region')),
    __param(2, routing_controllers_1.State('productFilter')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [skipTake_1.SkipTake,
        region_1.Region,
        productFilter_1.ProductFilter]),
    __metadata("design:returntype", Promise)
], GoodsController.prototype, "getGoodsData", null);
__decorate([
    routing_controllers_1.Get('/get/info'),
    routing_controllers_1.UseBefore(skipTake_inject_middleware_1.SkipTakeInjectMiddleware),
    routing_controllers_1.UseBefore(region_inject_middleware_1.RegionInjectMiddleware),
    routing_controllers_1.UseBefore(productFilter_inject_middleware_1.ProductFilterInjectMiddleware),
    __param(0, routing_controllers_1.State('skipTake')),
    __param(1, routing_controllers_1.State('region')),
    __param(2, routing_controllers_1.State('productFilter')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [skipTake_1.SkipTake,
        region_1.Region,
        productFilter_1.ProductFilter]),
    __metadata("design:returntype", Promise)
], GoodsController.prototype, "getGoodsInfo", null);
__decorate([
    routing_controllers_1.Get('/get/barcode/:barcode'),
    routing_controllers_1.UseBefore(region_inject_middleware_1.RegionInjectMiddleware),
    __param(0, routing_controllers_1.Param('barcode')), __param(1, routing_controllers_1.State('region')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, region_1.Region]),
    __metadata("design:returntype", Promise)
], GoodsController.prototype, "getGoodsByBarcode", null);
__decorate([
    routing_controllers_1.Get('/:id'),
    routing_controllers_1.UseBefore(region_inject_middleware_1.RegionInjectMiddleware),
    __param(0, routing_controllers_1.Param('id')), __param(1, routing_controllers_1.State('region')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, region_1.Region]),
    __metadata("design:returntype", Promise)
], GoodsController.prototype, "getSingle", null);
__decorate([
    routing_controllers_1.Get('/by/ids'),
    routing_controllers_1.UseBefore(ids_inject_middleware_1.IdsInjectMiddleware),
    routing_controllers_1.UseBefore(region_inject_middleware_1.RegionInjectMiddleware),
    __param(0, routing_controllers_1.State('ids')), __param(1, routing_controllers_1.State('region')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ids_1.Ids, region_1.Region]),
    __metadata("design:returntype", Promise)
], GoodsController.prototype, "getGoodsByIds", null);
GoodsController = __decorate([
    routing_controllers_1.JsonController('/goods')
], GoodsController);
exports.GoodsController = GoodsController;
