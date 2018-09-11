"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const env_config_1 = require("../config/env.config");
exports.ecomOptions = {
    method: 'GET',
    uri: '',
    auth: {
        user: env_config_1.ECOM_USER,
        pass: env_config_1.ECOM_PASS
    },
    json: true
};
