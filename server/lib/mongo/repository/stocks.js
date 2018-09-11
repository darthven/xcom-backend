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
const typedi_1 = require("typedi");
const repository_1 = require("./repository");
let StockRepository = class StockRepository extends repository_1.Repository {
    constructor() {
        super('stocks');
    }
    async createCollection() {
        await super.createCollection();
        await this.collection.createIndex({ goodsId: 1 });
        await this.collection.createIndex({ region: 1 });
        await this.collection.createIndex({ storePrice: 1 });
        await this.collection.createIndex({ storePrice: 1, region: -1 });
        await this.collection.createIndex({ goodsId: 1, region: 1, storeId: 1 }, { unique: true });
        await this.collection.createIndex({ goodsId: 1, storeId: -1 }, { unique: true });
        await this.collection.createIndex({ goodsId: 1, storePrice: -1 });
    }
};
StockRepository = __decorate([
    typedi_1.Service(),
    __metadata("design:paramtypes", [])
], StockRepository);
exports.StockRepository = StockRepository;
