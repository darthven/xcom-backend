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
const converter = require("csvtojson");
const typedi_1 = require("typedi");
const repository_1 = require("./repository");
const share_1 = require("../entity/share");
const goods_1 = require("./goods");
let SharesRepository = class SharesRepository extends repository_1.Repository {
    constructor() {
        super('shares');
    }
    async createCollection() {
        await super.createCollection();
    }
    async saveShares(csvFile) {
        const data = await converter({ trim: true, delimiter: '|' }).fromString(csvFile.buffer.toString());
        if (!data.length) {
            return false;
        }
        await this.dropCollection();
        await this.createCollection();
        for (const item of data) {
            const share = new share_1.Share(item);
            await this.collection.insertOne(share);
            await this.goods.setShare(share);
        }
        return data;
    }
    async getAll() {
        return this.collection
            .aggregate([
            {
                $group: {
                    _id: '$id',
                    description: { $addToSet: '$description' }
                }
            },
            {
                $project: {
                    id: '$_id',
                    description: 1,
                    _id: 0
                }
            }
        ])
            .toArray();
    }
};
__decorate([
    typedi_1.Inject(),
    __metadata("design:type", goods_1.GoodRepository)
], SharesRepository.prototype, "goods", void 0);
SharesRepository = __decorate([
    typedi_1.Service(),
    __metadata("design:paramtypes", [])
], SharesRepository);
exports.SharesRepository = SharesRepository;
