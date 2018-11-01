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
const skipTake_1 = require("../../parameters/skipTake");
const repository_1 = require("./repository");
let GoodRepository = class GoodRepository extends repository_1.Repository {
    constructor() {
        super('goods');
        this.firstProject = {
            _id: 0,
            id: 1,
            name: 1,
            manufacturer: 1,
            siteCatId: 1,
            country: 1,
            byPrescription: 1,
            mnn: 1,
            price: 1,
            img: 1,
            share: {
                $cond: {
                    if: { $lt: ['$share.endDate', new Date()] },
                    then: '$$REMOVE',
                    else: '$share'
                }
            }
        };
        this.secondProject = {
            id: 1,
            name: 1,
            manufacturer: { $ifNull: ['$manufacturer', ''] },
            country: 1,
            activeSubstance: '$mnn',
            categoryId: '$siteCatId',
            byPrescription: { $ifNull: ['$byPrescription', false] },
            inStock: { $ifNull: ['$price.available', 0] },
            price: {
                min: { $ifNull: ['$price.priceMin', null] },
                max: { $ifNull: ['$price.priceMax', null] }
            },
            icon: {
                url: { $concat: [env_config_1.IMAGE_URL, env_config_1.IMAGE_GOOD_FOLDER, '$img'] },
                urls: { $concat: [env_config_1.IMAGE_URL, env_config_1.IMAGE_GOOD_FOLDER, env_config_1.IMAGE_S_SUBFOLDER, '$img'] },
                urlm: { $concat: [env_config_1.IMAGE_URL, env_config_1.IMAGE_GOOD_FOLDER, env_config_1.IMAGE_M_SUBFOLDER, '$img'] }
            },
            'share.id': 1,
            'share.discountValue': 1,
            'share.packCount': 1,
            'share.attributeZOZ': 1,
            'share.startDate': 1,
            'share.endDate': 1,
            'share.description': 1
        };
        this.lookup = {
            from: 'shares',
            let: { id: '$id' },
            pipeline: [
                { $match: { $expr: { $eq: ['$goodId', '$$id'] } } },
                {
                    $project: {
                        _id: 0,
                        id: 1,
                        description: 1,
                        discountValue: 1,
                        packCount: 1,
                        attributeZOZ: 1,
                        startDate: 1,
                        endDate: 1,
                        regions: 1
                    }
                }
            ],
            as: 'shares'
        };
    }
    async createCollection() {
        await super.createCollection();
        await this.collection.createIndex({ name: 'text', tradeName: 'text', suffixes: 'text' });
        await this.collection.createIndex({ id: 1 });
        await this.collection.createIndex({ siteCatId: 1 });
        await this.collection.createIndex({ price: 1 }, { name: 'price' });
        await this.collection.createIndex({ img: 1 }, { name: 'img' });
        await this.collection.createIndex({ 'price.region': 1 }, { name: 'priceReg' });
        await this.collection.createIndex({ 'price.priceMin': 1 }, { name: 'priceMin' });
        await this.collection.createIndex({ 'price.priceMax': 1 }, { name: 'priceMax' });
        await this.collection.createIndex({ 'price.region': 1, 'price.priceMin': 1 }, { name: 'priceMinReg' });
        await this.collection.createIndex({ 'price.region': 1, 'price.priceMax': 1 }, { name: 'priceMaxReg' });
        await this.collection.createIndex({ 'price.region': 1, 'price.priceMin': 1, 'price.priceMax': -1 }, { name: 'priceMinMaxReg' });
    }
    async updateImageLink(id) {
        return this.collection.updateOne({ id }, { $set: { img: `${id}${env_config_1.IMAGE_DEFAULT_TYPE}` } });
    }
    async updateIndexes() {
        // await this.collection.dropIndex('id_1')
        // await this.collection.dropIndex('img_1')
        // await this.collection.dropIndex('siteCatId_1')
        // await this.collection.dropIndex('priceMinReg')
        // await this.collection.dropIndex('priceMinMaxReg')
        // await this.collection.dropIndex('priceReg')
        // await this.collection.dropIndex('price')
        await this.collection.dropIndex('price.min');
        await this.collection.dropIndex('price.max');
        await this.collection.dropIndex('name_text_tradeName_text_suffixes_text');
        await this.collection.createIndex({ name: 'text', tradeName: 'text', suffixes: 'text' });
        await this.collection.createIndex({ id: 1 });
        await this.collection.createIndex({ siteCatId: 1 });
        await this.collection.createIndex({ price: 1 }, { name: 'price' });
        await this.collection.createIndex({ img: 1 }, { name: 'img' });
        await this.collection.createIndex({ 'price.region': 1 }, { name: 'priceReg' });
        await this.collection.createIndex({ 'price.priceMin': 1 }, { name: 'priceMin' });
        await this.collection.createIndex({ 'price.priceMax': 1 }, { name: 'priceMax' });
        await this.collection.createIndex({ 'price.region': 1, 'price.priceMin': 1 }, { name: 'priceMinReg' });
        await this.collection.createIndex({ 'price.region': 1, 'price.priceMax': 1 }, { name: 'priceMaxReg' });
        await this.collection.createIndex({ 'price.region': 1, 'price.priceMin': 1, 'price.priceMax': -1 }, { name: 'priceMinMaxReg' });
    }
    async getAll(match, withoutPriceMatch, skipTake, region, sort, hint) {
        console.log(hint);
        console.log(await this.collection.indexInformation());
        let data;
        const fullLength = await this.getLength(match, hint);
        const diff = fullLength - skipTake.skip;
        if (diff < 0) {
            // only data without price
            const withoutPriceSkipTake = new skipTake_1.SkipTake({ skip: Math.abs(diff), take: skipTake.take });
            data = await this.getAllWithoutPrice(withoutPriceMatch, withoutPriceSkipTake, sort);
        }
        else if (diff < skipTake.take) {
            // data with and without price
            const withoutPriceSkipTake = new skipTake_1.SkipTake({ skip: 0, take: skipTake.take - diff });
            const withoutPriceRes = await this.getAllWithoutPrice(withoutPriceMatch, withoutPriceSkipTake, sort);
            const withPriceRes = await this.getAllWithPrice(match, skipTake, region, sort);
            data = withPriceRes.concat(withoutPriceRes);
        }
        else {
            // data only with price
            data = await this.getAllWithPrice(match, skipTake, region, sort);
        }
        return {
            fullLength,
            data
        };
    }
    async getAllWithPrice(match, skipTake, region, sort) {
        let pipeline = [
            { $match: match },
            sort,
            { $skip: skipTake.skip },
            { $limit: skipTake.take },
            { $project: this.firstProject },
            { $unwind: '$price' },
            { $match: { 'price.region': region.region } },
            { $project: this.secondProject }
        ];
        if (sort.$sort.price) {
            pipeline = [
                { $match: match },
                { $project: this.firstProject },
                { $unwind: '$price' },
                { $match: { 'price.region': region.region } },
                sort,
                { $skip: skipTake.skip },
                { $limit: skipTake.take },
                { $project: this.secondProject }
            ];
        }
        return this.collection.aggregate(pipeline, { allowDiskUse: true }).toArray();
    }
    async getAllWithoutPrice(match, skipTake, sort) {
        return this.collection
            .aggregate([
            { $match: match },
            sort,
            { $skip: skipTake.skip },
            { $limit: skipTake.take },
            { $project: this.firstProject },
            { $project: this.secondProject }
        ], { allowDiskUse: true })
            .toArray();
    }
    async getByIds(ids, region) {
        return this.collection
            .aggregate([
            { $match: { id: { $in: ids } } },
            { $project: this.firstProject },
            {
                $unwind: {
                    path: '$price',
                    preserveNullAndEmptyArrays: true
                }
            },
            { $match: { $or: [{ price: null }, { 'price.region': region.region }] } },
            { $project: this.secondProject }
        ])
            .toArray();
    }
    async getSingle(id, region) {
        return this.collection
            .aggregate([
            { $match: { id } },
            { $project: this.firstProject },
            {
                $unwind: {
                    path: '$price',
                    preserveNullAndEmptyArrays: true
                }
            },
            { $match: { $or: [{ price: null }, { 'price.region': region.region }] } },
            { $project: this.secondProject }
        ])
            .toArray();
    }
    async getLength(match, hint) {
        if (hint.hint) {
            return this.collection
                .find(match)
                .hint(hint.hint)
                .count();
        }
        return this.collection.find(match).count();
    }
    async getByBarcode(barcode, region) {
        return this.collection
            .aggregate([
            {
                $match: {
                    barcode: { $regex: `.*${barcode}.*` }
                }
            },
            { $project: this.firstProject },
            {
                $unwind: {
                    path: '$price',
                    preserveNullAndEmptyArrays: true
                }
            },
            { $match: { $or: [{ price: null }, { 'price.region': region.region }] } },
            { $project: this.secondProject }
        ])
            .toArray();
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
        ], hint)
            .toArray();
        return res[0] ? res[0].categories : res;
    }
    async getMinMaxPrice(match, region, hint) {
        const res = await this.collection
            .aggregate([
            { $match: match },
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
                $group: {
                    _id: null,
                    min: { $min: '$price.priceMin' },
                    max: { $max: '$price.priceMax' }
                }
            },
            {
                $project: {
                    min: 1,
                    max: 1,
                    _id: 0
                }
            }
        ], hint)
            .toArray();
        if (res[0]) {
            return res[0];
        }
        return {
            min: null,
            max: null
        };
    }
    async getDensity(match, region, hint, max) {
        // generate boundaries
        const min = 300;
        if (!max) {
            max = 2500;
        }
        const boundaries = [100, 200];
        for (let i = min; i <= max; i += 100) {
            boundaries.push(i);
        }
        return this.collection
            .aggregate([
            { $match: match },
            {
                $project: {
                    _id: 0,
                    id: 1,
                    price: 1
                }
            },
            { $unwind: '$price' },
            { $match: { 'price.region': region.region } },
            { $limit: 1000 },
            {
                $bucket: {
                    groupBy: '$price.priceMax',
                    boundaries,
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
        ], hint)
            .toArray();
    }
    async setShare(share) {
        return this.collection.findOneAndUpdate({ id: share.goodId }, { $set: { share } });
    }
};
GoodRepository = __decorate([
    typedi_1.Service(),
    __metadata("design:paramtypes", [])
], GoodRepository);
exports.GoodRepository = GoodRepository;
