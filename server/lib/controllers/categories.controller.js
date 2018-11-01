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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const routing_controllers_1 = require("routing-controllers");
const typedi_1 = require("typedi");
const categories_1 = require("../mongo/repository/categories");
let CategoriesController = class CategoriesController {
    async getCategories(query) {
        return this.categories.getAll(query);
    }
    async getCategoryById(id) {
        const res = await this.categories.getSingle(id);
        if (!res || !res[0]) {
            throw new routing_controllers_1.NotFoundError('region not found');
        }
        return res[0];
    }
};
__decorate([
    typedi_1.Inject(),
    __metadata("design:type", categories_1.CategoryRepository)
], CategoriesController.prototype, "categories", void 0);
__decorate([
    routing_controllers_1.Get(),
    __param(0, routing_controllers_1.QueryParam('query')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CategoriesController.prototype, "getCategories", null);
__decorate([
    routing_controllers_1.Get('/:id'),
    __param(0, routing_controllers_1.Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], CategoriesController.prototype, "getCategoryById", null);
CategoriesController = __decorate([
    routing_controllers_1.JsonController('/categories')
], CategoriesController);
exports.CategoriesController = CategoriesController;
