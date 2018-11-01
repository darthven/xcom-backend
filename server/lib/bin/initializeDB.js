"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const typedi_1 = require("typedi");
const env_config_1 = require("../config/env.config");
const logger_config_1 = require("../config/logger.config");
const mongo_1 = require("../mongo");
const admins_1 = require("../mongo/repository/admins");
async function start() {
    const mongodbOptions = { url: env_config_1.MONGO_URI, dbName: env_config_1.MONGO_DB };
    await mongo_1.default.connect(mongodbOptions);
    logger_config_1.default.debug('mongodb connected', mongodbOptions);
    const adminsRepository = typedi_1.Container.get(admins_1.AdminsRepository);
    await adminsRepository.dropCollection();
    await adminsRepository.createCollection();
    await mongo_1.default.close();
}
start().catch(err => logger_config_1.default.error('process exit 1', { err: err.message }));
