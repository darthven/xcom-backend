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
const class_validator_1 = require("class-validator");
class ProductFilter {
    constructor(query) {
        this.query = query.query;
        this.order = query.order;
        this.sort = query.sort;
        if (query.categories) {
            this.categories = query.categories.split(',').map(Number);
        }
        if (query.labelCategoryId) {
            this.labelCategoryId = parseInt(query.labelCategoryId, 10);
        }
        if (query.priceMin) {
            this.priceMin = parseInt(query.priceMin, 10);
        }
        if (query.priceMax) {
            this.priceMax = parseInt(query.priceMax, 10);
        }
        if (query.labelCategoryId) {
            this.labelCategoryId = parseInt(query.labelCategoryId, 10);
        }
    }
}
__decorate([
    class_validator_1.Length(1, 100),
    __metadata("design:type", String)
], ProductFilter.prototype, "query", void 0);
__decorate([
    class_validator_1.IsArray(),
    class_validator_1.IsPositive({ each: true }),
    __metadata("design:type", Array)
], ProductFilter.prototype, "categories", void 0);
__decorate([
    class_validator_1.IsPositive(),
    __metadata("design:type", Number)
], ProductFilter.prototype, "labelCategoryId", void 0);
__decorate([
    class_validator_1.IsPositive(),
    __metadata("design:type", Number)
], ProductFilter.prototype, "priceMin", void 0);
__decorate([
    class_validator_1.IsPositive(),
    __metadata("design:type", Number)
], ProductFilter.prototype, "priceMax", void 0);
__decorate([
    class_validator_1.IsEnum({ asc: 'asc', desc: 'desc' }),
    __metadata("design:type", String)
], ProductFilter.prototype, "order", void 0);
__decorate([
    class_validator_1.IsEnum({ asc: 'asc', desc: 'desc' }),
    __metadata("design:type", String)
], ProductFilter.prototype, "sort", void 0);
exports.ProductFilter = ProductFilter;
