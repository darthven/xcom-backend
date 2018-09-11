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
const productFilter_inject_middleware_1 = require("../middlewares/productFilter.inject.middleware");
const region_inject_middleware_1 = require("../middlewares/region.inject.middleware");
const skipTake_inject_middleware_1 = require("../middlewares/skipTake.inject.middleware");
const GoodsHint_1 = require("../mongo/queries/GoodsHint");
const GoodsQuery_1 = require("../mongo/queries/GoodsQuery");
const GoodsStrictQuery_1 = require("../mongo/queries/GoodsStrictQuery");
const goods_1 = require("../mongo/repository/goods");
const stocks_1 = require("../mongo/repository/stocks");
const productFilter_1 = require("../parameters/productFilter");
const region_1 = require("../parameters/region");
const skipTake_1 = require("../parameters/skipTake");
let AuthController = class AuthController {
    async getGoods(skipTake, region, filter) {
        const strict = new GoodsStrictQuery_1.GoodsStrictQuery(region.region, filter.query, filter.categories, filter.priceMin, filter.priceMax);
        const match = new GoodsQuery_1.GoodsQuery(region.region, filter.query, filter.categories, filter.priceMin, filter.priceMax);
        const hint = new GoodsHint_1.GoodsHint(filter.priceMin, filter.priceMax);
        return {
            length: await this.goods.getLength(strict, hint),
            categories: await this.goods.getCategories(strict, hint),
            density: await this.goods.getDensity(strict, region, hint),
            data: await this.goods.getAll(match, skipTake, region)
        };
    }
    async getSingle(id, region) {
        return this.goods.getSingle(id, region);
    }
};
__decorate([
    typedi_1.Inject(),
    __metadata("design:type", goods_1.GoodRepository)
], AuthController.prototype, "goods", void 0);
__decorate([
    typedi_1.Inject(),
    __metadata("design:type", stocks_1.StockRepository)
], AuthController.prototype, "stocks", void 0);
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
], AuthController.prototype, "getGoods", null);
__decorate([
    routing_controllers_1.Get('/:id'),
    routing_controllers_1.UseBefore(region_inject_middleware_1.RegionInjectMiddleware),
    __param(0, routing_controllers_1.Param('id')), __param(1, routing_controllers_1.State('region')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, region_1.Region]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getSingle", null);
AuthController = __decorate([
    routing_controllers_1.JsonController('/goods')
], AuthController);
exports.AuthController = AuthController;
