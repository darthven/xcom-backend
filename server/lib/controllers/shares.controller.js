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
const shares_1 = require("../mongo/repository/shares");
let SharesController = class SharesController {
    uploadCSVFile(file) {
        return this.shares.saveShares(file);
    }
    getShares() {
        return this.shares.getAll();
    }
};
__decorate([
    typedi_1.Inject(),
    __metadata("design:type", shares_1.SharesRepository)
], SharesController.prototype, "shares", void 0);
__decorate([
    routing_controllers_1.Authorized(),
    routing_controllers_1.Post(),
    __param(0, routing_controllers_1.UploadedFile('shares', { required: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SharesController.prototype, "uploadCSVFile", null);
__decorate([
    routing_controllers_1.Get(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SharesController.prototype, "getShares", null);
SharesController = __decorate([
    routing_controllers_1.JsonController('/shares')
], SharesController);
exports.SharesController = SharesController;
