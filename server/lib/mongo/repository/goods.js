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
let GoodRepository = class GoodRepository extends repository_1.Repository {
    constructor() {
        super('goods');
    }
    async createCollection() {
        await super.createCollection();
        await this.collection.createIndex({ name: 'text', tradeName: 'text' });
        await this.collection.createIndex({ id: 1 }, { unique: true });
        await this.collection.createIndex({ siteCatId: 1 });
        await this.collection.createIndex({ 'price.region': 1 });
    }
    async getAll(match, skipTake, region) {
        return this.collection
            .aggregate([
            { $match: match },
            { $skip: skipTake.skip || 0 },
            { $limit: skipTake.take || 10 },
            {
                $project: {
                    _id: 0,
                    id: 1,
                    name: 1,
                    manufacturer: 1,
                    siteCatId: 1,
                    price: 1
                }
            },
            {
                $unwind: {
                    path: '$price',
                    preserveNullAndEmptyArrays: true
                }
            },
            { $match: { $or: [{ price: null }, { 'price.region': region.region }] } },
            {
                $project: {
                    id: 1,
                    name: 1,
                    manufacturer: 1,
                    categoryId: 1,
                    priceMin: '$price.priceMin',
                    priceMax: '$price.priceMax'
                }
            }
        ])
            .toArray();
    }
    async getSingle(id, region) {
        return this.collection
            .aggregate([
            { $match: { id } },
            {
                $project: {
                    _id: 0,
                    id: 1,
                    name: 1,
                    manufacturer: 1,
                    siteCatId: 1
                }
            },
            {
                $lookup: {
                    from: 'stocks',
                    localField: 'id',
                    foreignField: 'goodsId',
                    as: 'price'
                }
            },
            { $unwind: '$price' },
            { $match: { 'price.region': region.region } },
            {
                $group: {
                    _id: '$id',
                    name: { $first: '$name' },
                    manufacturer: { $first: '$manufacturer' },
                    categoryId: { $first: '$siteCatId' },
                    availableCount: { $max: '$price.quantity' },
                    priceMin: { $min: '$price.storePrice' },
                    priceMax: { $max: '$price.storePrice' }
                }
            },
            {
                $project: {
                    id: '$_id',
                    _id: 0,
                    name: 1,
                    manufacturer: 1,
                    categoryId: 1,
                    priceMin: 1,
                    priceMax: 1,
                    availableCount: 1
                }
            }
        ])
            .toArray();
    }
    async getLength(match, hint) {
        return this.collection
            .find(match)
            .hint(hint.hint)
            .count();
    }
    async getCategories(match, hint) {
        const res = await this.collection
            .aggregate([
            { $match: match },
            { $limit: 1000 },
            {
                $group: {
                    _id: '$siteCatId'
                }
            },
            {
                $group: {
                    _id: {},
                    categories: { $push: '$_id' }
                }
            },
            {
                $project: {
                    _id: 0,
                    categories: 1
                }
            }
        ], { hint: hint.hint })
            .toArray();
        return res[0].categories;
    }
    async getDensity(match, region, hint) {
        return this.collection
            .aggregate([
            { $match: match },
            { $limit: 1000 },
            {
                $project: {
                    _id: 0,
                    id: 1,
                    price: 1
                }
            },
            { $unwind: '$price' },
            { $match: { 'price.region': region.region } },
            {
                $bucket: {
                    groupBy: '$price.priceMax',
                    boundaries: [
                        100,
                        200,
                        300,
                        400,
                        500,
                        600,
                        700,
                        800,
                        900,
                        1000,
                        1100,
                        1200,
                        1300,
                        1400,
                        1500,
                        1600,
                        1700,
                        1800,
                        1900,
                        2000,
                        2100,
                        2200
                    ],
                    default: 'Other',
                    output: {
                        count: { $sum: 1 }
                    }
                }
            },
            {
                $project: {
                    value: '$_id',
                    count: 1,
                    _id: 0
                }
            }
        ], { hint: hint.hint })
            .toArray();
    }
};
GoodRepository = __decorate([
    typedi_1.Service(),
    __metadata("design:paramtypes", [])
], GoodRepository);
exports.GoodRepository = GoodRepository;
