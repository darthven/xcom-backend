export const NODE_ENV = process.env.NODE_ENV || 'development'
export const PORT = process.env.PORT || '1340'
export const ECOM_URL = process.env.ECOM_URL || 'http://ws.erkapharm.com:8990/ecom/hs/'
export const ECOM_USER = process.env.ECOM_USER || 'IdEast'
export const ECOM_PASS = process.env.ECOM_PASS || 'KZMY5N'
export const MONGO_URI = process.env.MONGO_HOST || 'mongodb://localhost:27017'
export const MONGO_DB = process.env.MONGO_DB || 'xcom-prod'
export const FTP_CLIENT_HOST = process.env.FTP_CLIENT_HOST || 'ftp.stoletov.ru'
export const FTP_CLIENT_PORT = 21
export const FTP_CLIENT_USER = process.env.FTP_CLIENT_USER || 'ws_ImagineWeb'
export const FTP_CLIENT_PASSWORD = process.env.FTP_CLIENT_PASSWORD || '9035-51109aefc7dd'
export const IMAGE_URL = process.env.IMAGE_URL || 'http://138.68.86.83/static/images/'
export const IMAGE_FOLDER = process.env.IMAGE_FOLDER || 'images/' // '/var/www/xcom/static/images/' // - production
export const IMAGE_TMP_FOLDER = process.env.IMAGE_TMP_FOLDER || 'tmp/'
export const IMAGE_GOOD_FOLDER = process.env.IMAGE_GOOD_FOLDER || 'goods/'
export const IMAGE_STORE_TYPE_FOLDER = process.env.IMAGE_STORE_TYPE_FOLDER || 'types/'
export const IMAGE_CATEGORIES_FOLDER = process.env.IMAGE_CATEGORIES_FOLDER || 'categories/'
export const IMAGE_S_SUBFOLDER = process.env.IMAGE_S_SUBFOLDER || 's/'
export const IMAGE_M_SUBFOLDER = process.env.IMAGE_M_SUBFOLDER || 'm/'
export const LOGS_FOLDER = process.env.LOGS_FOLDER || 'logs/'
export const IMAGE_DEFAULT_TYPE = process.env.IMAGE_DEFAULT_TYPE || '.jpeg'
export const IMAGE_CATEGORY_TYPE = process.env.IMAGE_DEFAULT_TYPE || '.png'
export const MANZANA_CASH_URL =
    process.env.MANZANA_CASH_URL || 'http://crmozerki.manzanagroup.ru:8083/posprocessing.asmx'
export const MANZANA_CLIENT_URL =
    process.env.MANZANA_CLIENT_URL || 'https://cosnozerki.manzanagroup.ru/customerofficeservice/'
export const SBOL_GATEWAY_URL: string = process.env.SBOL_GATEWAY_URL!

// 'http://ws.erkapharm.com:8990/ecom/hs/'
// 'http://ws-dev.erkapharm.com:8990/ecom_test/hs'
// http://138.68.86.83:1340
