"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const schedule = require("node-schedule");
require("reflect-metadata");
const typedi_1 = require("typedi");
const env_config_1 = require("../config/env.config");
const logger_config_1 = require("../config/logger.config");
const updater_1 = require("../ecom/updater");
const mongo_1 = require("../mongo");
async function shedulerStart(ecomUpdater) {
    // every week
    schedule.scheduleJob('0 0 * * 0', () => {
        ecomUpdater.updatePayTypes();
        ecomUpdater.updateOrderStatuses();
        ecomUpdater.updatePrices();
    });
    // every day
    schedule.scheduleJob('0 0 * * *', () => {
        ecomUpdater.updateCategories();
        ecomUpdater.updateStores();
        ecomUpdater.updateGoods();
    });
    // every hour
    schedule.scheduleJob('0 * * * *', () => {
        ecomUpdater.updateStocks();
    });
}
async function start() {
    const mongodbOptions = { url: env_config_1.MONGO_URI, dbName: env_config_1.MONGO_DB };
    await mongo_1.default.connect(mongodbOptions);
    logger_config_1.default.debug('mongodb connected', mongodbOptions);
    const ecomUpdater = typedi_1.Container.get(updater_1.EcomUpdater);
    await shedulerStart(ecomUpdater);
}
start().catch(err => logger_config_1.default.error('process exit 1', { message: err.message }));
