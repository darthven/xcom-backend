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
const locationFilter_inject_middleware_1 = require("../middlewares/locationFilter.inject.middleware");
const LocationsQuery_1 = require("../mongo/queries/LocationsQuery");
const stores_1 = require("../mongo/repository/stores");
const locationFilter_1 = require("../parameters/locationFilter");
let StoresController = class StoresController {
    async getLocations(filter) {
        const query = new LocationsQuery_1.LocationsQuery(filter);
        return this.stores.getAll(query);
    }
    async getLocationById(id) {
        const res = await this.stores.getSingle(id);
        if (!res || !res[0]) {
            throw new routing_controllers_1.NotFoundError('store not found');
        }
        return res[0];
    }
    async getRee() {
        return this.stores.getRee();
    }
};
__decorate([
    typedi_1.Inject(),
    __metadata("design:type", stores_1.StoreRepository)
], StoresController.prototype, "stores", void 0);
__decorate([
    routing_controllers_1.Get(),
    routing_controllers_1.UseBefore(locationFilter_inject_middleware_1.LocationFilterInjectMiddleware),
    __param(0, routing_controllers_1.State('locationFilter')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [locationFilter_1.LocationFilter]),
    __metadata("design:returntype", Promise)
], StoresController.prototype, "getLocations", null);
__decorate([
    routing_controllers_1.Get('/:id'),
    __param(0, routing_controllers_1.Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], StoresController.prototype, "getLocationById", null);
__decorate([
    routing_controllers_1.Get('/ree/ree'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], StoresController.prototype, "getRee", null);
StoresController = __decorate([
    routing_controllers_1.JsonController('/stores')
], StoresController);
exports.StoresController = StoresController;
