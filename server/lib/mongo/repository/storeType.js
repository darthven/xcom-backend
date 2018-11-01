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
let StoreTypeRepository = class StoreTypeRepository extends repository_1.Repository {
    constructor() {
        super('storeTypes');
    }
    async createCollection() {
        await super.createCollection();
        await this.collection.createIndex({ name: 1 });
    }
    async getAll() {
        return this.collection
            .aggregate([
            {
                $project: {
                    name: 1,
                    count: 1,
                    icon: {
                        url: { $concat: [env_config_1.IMAGE_URL, env_config_1.IMAGE_STORE_TYPE_FOLDER, '$img'] },
                        urls: null,
                        urlm: null
                    },
                    _id: 0
                }
            }
        ])
            .toArray();
    }
    async getAllByRegion(region) {
        return this.collection
            .aggregate([
            {
                $project: {
                    _id: 0,
                    count: 0
                }
            },
            { $unwind: '$regions' },
            { $match: { 'regions.region': region } },
            {
                $project: {
                    name: 1,
                    count: '$regions.count',
                    icon: {
                        url: { $concat: [env_config_1.IMAGE_URL, env_config_1.IMAGE_STORE_TYPE_FOLDER, '$img'] },
                        urls: null,
                        urlm: null
                    }
                }
            }
        ])
            .toArray();
    }
};
StoreTypeRepository = __decorate([
    typedi_1.Service(),
    __metadata("design:paramtypes", [])
], StoreTypeRepository);
exports.StoreTypeRepository = StoreTypeRepository;
