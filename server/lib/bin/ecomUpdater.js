"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const typedi_1 = require("typedi");
const env_config_1 = require("../config/env.config");
const logger_config_1 = require("../config/logger.config");
const updater_1 = require("../ecom/updater");
const mongo_1 = require("../mongo");
async function start() {
    const mongodbOptions = { url: env_config_1.MONGO_URI, dbName: env_config_1.MONGO_DB };
    await mongo_1.default.connect(mongodbOptions);
    logger_config_1.default.debug('mongodb connected', mongodbOptions);
    const ecomUpdater = typedi_1.Container.get(updater_1.EcomUpdater);
    // await ecomUpdater.updatePayTypes()
    // await ecomUpdater.updateOrderStatuses()
    // await ecomUpdater.updateStores()
    // await ecomUpdater.updateGoods()
    // await ecomUpdater.updateCategories()
    // await ecomUpdater.updateStocks()
    await ecomUpdater.updatePrices();
    await mongo_1.default.close();
}
start().catch(err => {
    logger_config_1.default.error(err.message);
    mongo_1.default.close();
});
