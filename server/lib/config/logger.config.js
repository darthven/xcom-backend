"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_root_path_1 = require("app-root-path");
const winston_1 = require("winston");
const options = {
    error: {
        name: 'error-file',
        level: 'error',
        filename: `${app_root_path_1.path}/logs/error.log`,
        handleExceptions: true,
        maxsize: 5242880,
        maxFiles: 5
    },
    info: {
        name: 'info-file',
        level: 'info',
        filename: `${app_root_path_1.path}/logs/info.log`,
        handleExceptions: true,
        maxsize: 5242880,
        maxFiles: 5
    },
    console: {
        level: 'debug',
        handleExceptions: true,
        format: winston_1.format.combine(winston_1.format.colorize(), winston_1.format.simple())
    }
};
// IF DRYRUN ENABLED LOG CONFIGURATION IS EMPTY
const logger = winston_1.createLogger({
    transports: [
        new winston_1.transports.File(options.error),
        new winston_1.transports.File(options.info),
        new winston_1.transports.Console(options.console)
    ],
    exitOnError: false
});
exports.default = logger;
