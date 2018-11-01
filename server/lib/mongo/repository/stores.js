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
const env_config_1 = require("../../config/env.config");
const repository_1 = require("./repository");
let StoreRepository = class StoreRepository extends repository_1.Repository {
    constructor() {
        super('stores');
    }
    async createCollection() {
        await super.createCollection();
        await this.collection.createIndex({ id: 1 }, { unique: true });
        await this.collection.createIndex({ storeType: 1 });
        await this.collection.createIndex({ region: 1 });
        await this.collection.createIndex({ regionCode: 1 });
    }
    async getMinMax() {
        return this.collection
            .aggregate([
            {
                $project: {
                    _id: 0,
                    stocks: 1
                }
            },
            { $unwind: '$stocks' },
            {
                $group: {
                    _id: { goodsId: '$stocks.goodsId', region: '$stocks.region' },
                    priceMin: { $min: '$stocks.storePrice' },
                    priceMax: { $max: '$stocks.storePrice' },
                    available: { $max: '$stocks.quantity' }
                }
            },
            {
                $project: {
                    _id: 0,
                    id: '$_id.goodsId',
                    region: '$_id.region',
                    priceMin: 1,
                    priceMax: 1,
                    available: 1
                }
            },
            {
                $group: {
                    _id: '$id',
                    price: {
                        $push: {
                            region: '$region',
                            priceMin: '$priceMin',
                            priceMax: '$priceMax',
                            available: '$available'
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    id: '$_id',
                    price: 1
                }
            }
        ], { allowDiskUse: true })
            .toArray();
    }
    async getAll(query) {
        return this.collection
            .aggregate([
            { $match: query },
            {
                $project: {
                    _id: 0,
                    id: 1,
                    name: 1,
                    region: '$regionCode',
                    storeType: 1,
                    address: 1,
                    phone: '$phoneNumber',
                    workTime: 1,
                    location: 1,
                    stations: 1
                }
            },
            {
                $lookup: {
                    from: 'storeTypes',
                    localField: 'storeType',
                    foreignField: 'name',
                    as: 'type'
                }
            },
            { $unwind: '$type' },
            {
                $project: {
                    id: 1,
                    name: 1,
                    region: 1,
                    address: 1,
                    phone: 1,
                    workTime: 1,
                    location: 1,
                    stations: 1,
                    'type.name': 1,
                    'type.icon': {
                        url: { $concat: [env_config_1.IMAGE_URL, env_config_1.IMAGE_STORE_TYPE_FOLDER, '$type.img'] },
                        urls: null,
                        urlm: null
                    }
                }
            }
        ])
            .toArray();
    }
    async getSingle(id) {
        return this.collection
            .aggregate([
            { $match: { id } },
            {
                $project: {
                    _id: 0,
                    id: 1,
                    name: 1,
                    region: '$regionCode',
                    storeType: 1,
                    address: 1,
                    phone: '$phoneNumber',
                    workTime: 1,
                    location: 1,
                    stations: 1
                }
            },
            {
                $lookup: {
                    from: 'storeTypes',
                    localField: 'storeType',
                    foreignField: 'name',
                    as: 'type'
                }
            },
            { $unwind: '$type' },
            {
                $project: {
                    id: 1,
                    name: 1,
                    region: 1,
                    address: 1,
                    phone: 1,
                    workTime: 1,
                    location: 1,
                    stations: 1,
                    'type.name': 1,
                    'type.icon': {
                        url: { $concat: [env_config_1.IMAGE_URL, env_config_1.IMAGE_STORE_TYPE_FOLDER, '$type.img'] },
                        urls: null,
                        urlm: null
                    }
                }
            }
        ])
            .toArray();
    }
    async getLocationsType() {
        const res = await this.collection
            .aggregate([
            {
                $group: {
                    _id: { storeType: '$storeType', region: '$regionCode' },
                    name: { $first: '$storeType' },
                    region: { $first: '$regionCode' },
                    count: { $sum: 1 }
                }
            },
            {
                $group: {
                    _id: { name: '$name' },
                    name: { $first: '$name' },
                    count: { $sum: '$count' },
                    regions: {
                        $push: { region: '$region', count: '$count' }
                    }
                }
            },
            {
                $project: {
                    _id: 0
                }
            }
        ])
            .toArray();
        return res.filter(item => (item.name ? item : null));
    }
    async getRegions() {
        return this.collection
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
    }
    async getRee() {
        return this.collection
            .aggregate([
            {
                $match: {
                    GPS: { $exists: false }
                }
            },
            {
                $project: {
                    _id: 0,
                    id: 1,
                    name: 1,
                    regionCode: 1,
                    storeType: 1,
                    address: 1,
                    phoneNumber: 1,
                    workTime: 1,
                    GPS: 1,
                    active: 1
                }
            }
        ])
            .toArray();
    }
};
StoreRepository = __decorate([
    typedi_1.Service(),
    __metadata("design:paramtypes", [])
], StoreRepository);
exports.StoreRepository = StoreRepository;
