"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const typedi_1 = require("typedi");
const env_config_1 = require("../config/env.config");
const logger_config_1 = require("../config/logger.config");
const uploader_1 = require("../ecom/uploader");
const mongo_1 = require("../mongo");
async function start() {
    const mongodbOptions = { url: env_config_1.MONGO_URI, dbName: env_config_1.MONGO_DB };
    await mongo_1.default.connect(mongodbOptions);
    logger_config_1.default.debug('mongodb connected', mongodbOptions);
    const ecomUploader = typedi_1.Container.get(uploader_1.EcomUploader);
    // await ecomUploader.uploadPayTypes()
    // await ecomUploader.uploadOrderStatuses()
    // await ecomUploader.uploadStores()
    // await ecomUploader.uploadGoods()
    // await ecomUploader.uploadCategories()
    await ecomUploader.uploadStocks();
    await mongo_1.default.close();
}
start().catch(err => logger_config_1.default.error('process exit 1', { message: err.message }));
