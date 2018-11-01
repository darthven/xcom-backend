"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NODE_ENV = process.env.NODE_ENV || 'development';
exports.PORT = process.env.PORT || '1340';
exports.ECOM_URL = process.env.ECOM_URL || 'http://ws.erkapharm.com:8990/ecom/hs/';
exports.ECOM_USER = process.env.ECOM_USER || 'IdEast';
exports.ECOM_PASS = process.env.ECOM_PASS || 'KZMY5N';
exports.MONGO_URI = process.env.MONGO_HOST || 'mongodb://localhost:27017';
exports.MONGO_DB = process.env.MONGO_DB || 'xcom-prod';
exports.FTP_CLIENT_HOST = process.env.FTP_CLIENT_HOST || 'ftp.stoletov.ru';
exports.FTP_CLIENT_PORT = 21;
exports.FTP_CLIENT_USER = process.env.FTP_CLIENT_USER || 'ws_ImagineWeb';
exports.FTP_CLIENT_PASSWORD = process.env.FTP_CLIENT_PASSWORD || '9035-51109aefc7dd';
exports.IMAGE_TMP_FOLDER = process.env.IMAGE_TMP_FOLDER || '/tmp';
exports.IMAGE_URL = process.env.IMAGE_URL || 'http://138.68.86.83/static/images/';
exports.IMAGE_DEFAULT_TYPE = process.env.IMAGE_DEFAULT_TYPE || '.jpeg';
exports.IMAGE_CATEGORY_TYPE = process.env.IMAGE_DEFAULT_TYPE || '.png';
exports.IMAGE_S_SUBFOLDER = process.env.IMAGE_S_SUBFOLDER || 's/';
exports.IMAGE_M_SUBFOLDER = process.env.IMAGE_M_SUBFOLDER || 'm/';
exports.IMAGE_FOLDER = process.env.IMAGE_FOLDER || 'images/'; // '/var/www/xcom/static/images/' // - production
exports.IMAGE_GOOD_FOLDER = process.env.IMAGE_GOOD_FOLDER || 'goods/';
exports.IMAGE_STORE_TYPE_FOLDER = process.env.IMAGE_STORE_TYPE_FOLDER || 'types/';
exports.IMAGE_CATEGORIES_FOLDER = process.env.IMAGE_CATEGORIES_FOLDER || 'categories/';
exports.MANZANA_CASH_URL = process.env.MANZANA_CASH_URL || 'http://mbsdevcrm15sp1.manzanagroup.ru:10001/POSProcessing.asmx';
// 'http://ws.erkapharm.com:8990/ecom/hs/'
// 'http://ws-dev.erkapharm.com:8990/ecom_test/hs'
// http://138.68.86.83:1340
