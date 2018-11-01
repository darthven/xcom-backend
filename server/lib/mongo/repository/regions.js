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
let RegionsRepository = class RegionsRepository extends repository_1.Repository {
    constructor() {
        super('regions');
    }
    async createCollection() {
        await super.createCollection();
        await this.collection.createIndex({ regionCode: 1 }, { unique: true });
        await this.collection.createIndex({ polygon: '2dsphere' });
    }
    async getAll() {
        return this.collection
            .aggregate([
            {
                $project: {
                    _id: 0,
                    id: '$regionCode',
                    name: '$region'
                }
            },
            {
                $sort: { id: 1 }
            }
        ])
            .toArray();
    }
    async getSingle(id) {
        return this.collection
            .aggregate([
            { $match: { regionCode: id } },
            {
                $project: {
                    _id: 0,
                    id: '$regionCode',
                    name: '$region'
                }
            },
            {
                $sort: { id: 1 }
            }
        ])
            .toArray();
    }
    async getRegionByLatLng(lat, lng) {
        return this.collection
            .aggregate([
            {
                $match: {
                    polygon: {
                        $geoIntersects: {
                            $geometry: {
                                type: 'Point',
                                coordinates: [lng, lat]
                            }
                        }
                    }
                }
            },
            {
                $project: {
                    id: '$regionCode',
                    name: '$region',
                    _id: 0
                }
            },
            {
                $project: {
                    polygon: 0
                }
            }
        ])
            .toArray();
    }
};
RegionsRepository = __decorate([
    typedi_1.Service(),
    __metadata("design:paramtypes", [])
], RegionsRepository);
exports.RegionsRepository = RegionsRepository;
