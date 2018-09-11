"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NODE_ENV = process.env.NODE_ENV || 'development';
exports.PORT = process.env.PORT || '1340';
exports.ECOM_URL = process.env.ECOM_URL || 'http://ws.erkapharm.com:8990/ecom/hs/';
exports.ECOM_USER = process.env.ECOM_USER || 'IdEast';
exports.ECOM_PASS = process.env.ECOM_PASS || 'KZMY5N';
exports.MONGO_URI = process.env.MONGO_HOST || 'mongodb://localhost:27017';
exports.MONGO_DB = process.env.MONGO_DB || 'xcom-prod';
// 'http://ws.erkapharm.com:8990/ecom/hs/'
// 'http://ws-dev.erkapharm.com:8990/ecom_test/hs'
