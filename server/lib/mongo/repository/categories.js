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
const CategoriesQuery_1 = require("../queries/CategoriesQuery");
const repository_1 = require("./repository");
let CategoryRepository = class CategoryRepository extends repository_1.Repository {
    constructor() {
        super('categories');
    }
    async createCollection() {
        await super.createCollection();
        await this.collection.createIndex({ name: 'text' });
        await this.collection.createIndex({ id: 1 });
    }
    async getAll(search) {
        const query = new CategoriesQuery_1.CategoriesQuery(search);
        return this.collection
            .aggregate([
            { $match: { $or: [{ productCount: { $ne: 0 } }, { treeSumCount: { $ne: 0 } }] } },
            { $match: query },
            {
                $project: {
                    id: 1,
                    name: 1,
                    parentId: 1,
                    level: 1,
                    productCount: 1,
                    treeSumCount: 1,
                    icon: {
                        url: { $concat: [env_config_1.IMAGE_URL, env_config_1.IMAGE_CATEGORIES_FOLDER, '$img'] },
                        urls: null,
                        urlm: null
                    },
                    _id: 0
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
                    id: 1,
                    name: 1,
                    parentId: 1,
                    level: 1,
                    productCount: 1,
                    treeSumCount: 1,
                    icon: {
                        url: { $concat: [env_config_1.IMAGE_URL, env_config_1.IMAGE_CATEGORIES_FOLDER, '$img'] },
                        urls: null,
                        urlm: null
                    },
                    _id: 0
                }
            }
        ])
            .toArray();
    }
};
CategoryRepository = __decorate([
    typedi_1.Service(),
    __metadata("design:paramtypes", [])
], CategoryRepository);
exports.CategoryRepository = CategoryRepository;
