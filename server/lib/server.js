"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Koa = require("koa");
require("reflect-metadata");
const routing_controllers_1 = require("routing-controllers");
const typedi_1 = require("typedi");
const logging_middleware_1 = require("./middlewares/logging.middleware");
routing_controllers_1.useContainer(typedi_1.default);
const koa = new Koa();
exports.default = routing_controllers_1.useKoaServer(koa, {
    routePrefix: '/api',
    middlewares: [logging_middleware_1.LoggingMiddleware],
    controllers: [__dirname + '/controllers/**/*'],
    validation: {
        skipMissingProperties: true
    }
});
