'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const env_config_1 = require("../config/env.config");
const logger_config_1 = require("../config/logger.config");
const index_1 = require("../mongo/index");
const server_1 = require("../server");
function startServer() {
    server_1.default.listen(env_config_1.PORT, () => {
        logger_config_1.default.debug(`HTTP Server listening on port: ${env_config_1.PORT}`);
        logger_config_1.default.debug(`Environment: ${env_config_1.NODE_ENV}`);
    });
}
async function start() {
    const mongodbOptions = { url: env_config_1.MONGO_URI, dbName: env_config_1.MONGO_DB };
    await index_1.default.connect(mongodbOptions);
    logger_config_1.default.debug('mongodb connected', mongodbOptions);
    startServer();
}
start().catch(err => logger_config_1.default.error('process exit 1', { err: err.message }));
