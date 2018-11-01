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
const env_config_1 = require("../config/env.config");
const soapUtil_1 = require("../utils/soapUtil");
let ChequeController = class ChequeController {
    async handleSoftCheque(request, type) {
        console.log('type', type);
        return this.soapUtil.sendRequestFromXml(env_config_1.MANZANA_CASH_URL, this.soapUtil.createChequeRequest(request, type), {
            'Content-Type': 'text/xml;charset=UTF-8'
        });
    }
};
__decorate([
    typedi_1.Inject(),
    __metadata("design:type", soapUtil_1.default)
], ChequeController.prototype, "soapUtil", void 0);
__decorate([
    routing_controllers_1.HttpCode(200),
    routing_controllers_1.Post('/:type'),
    __param(0, routing_controllers_1.Body()), __param(1, routing_controllers_1.Param('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ChequeController.prototype, "handleSoftCheque", null);
ChequeController = __decorate([
    routing_controllers_1.JsonController('/cheque')
], ChequeController);
exports.ChequeController = ChequeController;
