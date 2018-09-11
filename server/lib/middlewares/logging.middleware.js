"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const routing_controllers_1 = require("routing-controllers");
const logger_config_1 = require("../config/logger.config");
let i = 0;
let LoggingMiddleware = class LoggingMiddleware {
    async use(context, next) {
        logger_config_1.default.info(`REQ ${i} ${context.method} ${context.url}`, {
            body: context.request.body,
            ip: context.ip
        });
        await next();
        logger_config_1.default.info(`RES ${i} ${context.method} ${context.url}`, {
            statusCode: context.response.status,
        });
        i++;
    }
};
LoggingMiddleware = __decorate([
    routing_controllers_1.Middleware({ type: 'before' })
], LoggingMiddleware);
exports.LoggingMiddleware = LoggingMiddleware;
