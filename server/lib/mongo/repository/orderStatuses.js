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
let OrderStatusRepository = class OrderStatusRepository extends repository_1.Repository {
    constructor() {
        super('orderStatuses');
    }
    async createCollection() {
        await super.createCollection();
        await this.collection.createIndex({ id: 1 }, { unique: true });
    }
};
OrderStatusRepository = __decorate([
    typedi_1.Service(),
    __metadata("design:paramtypes", [])
], OrderStatusRepository);
exports.OrderStatusRepository = OrderStatusRepository;
