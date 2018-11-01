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
const regions_1 = require("../mongo/repository/regions");
let RegionsController = class RegionsController {
    async getRegions() {
        return this.regions.getAll();
    }
    async getRegionById(id) {
        const res = await this.regions.getSingle(id);
        if (!res || !res[0]) {
            throw new routing_controllers_1.NotFoundError('region not found');
        }
        return res[0];
    }
    async getRegionByLatLng(lat, lng) {
        let res;
        try {
            res = await this.regions.getRegionByLatLng(lat, lng);
        }
        catch (e) {
            throw new routing_controllers_1.BadRequestError(e.message);
        }
        if (!res || !res[0]) {
            throw new routing_controllers_1.NotFoundError('region not found');
        }
        return res[0];
    }
};
__decorate([
    typedi_1.Inject(),
    __metadata("design:type", regions_1.RegionsRepository)
], RegionsController.prototype, "regions", void 0);
__decorate([
    routing_controllers_1.Get(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RegionsController.prototype, "getRegions", null);
__decorate([
    routing_controllers_1.Get('/:id'),
    __param(0, routing_controllers_1.Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], RegionsController.prototype, "getRegionById", null);
__decorate([
    routing_controllers_1.Get('/lat/:lat/lng/:lng'),
    __param(0, routing_controllers_1.Param('lat')), __param(1, routing_controllers_1.Param('lng')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], RegionsController.prototype, "getRegionByLatLng", null);
RegionsController = __decorate([
    routing_controllers_1.JsonController('/regions')
], RegionsController);
exports.RegionsController = RegionsController;
