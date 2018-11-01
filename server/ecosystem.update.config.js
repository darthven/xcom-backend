module.exports = {
    apps: [
        {
            name: 'xcom-update',
            script: './lib/bin/ecomUpdater.js',
            watch: false,
            env: {
                NODE_ENV: 'production',
                ECOM_URL: 'http://ws.erkapharm.com:8990/ecom/hs/',
                ECOM_USER: 'IdEast',
                ECOM_PASS: 'KZMY5N',
                MONGO_URI: 'mongodb://localhost:27017',
                MONGO_DB: 'xcom-prod',
                IMAGE_FOLDER: '/var/www/xcom/static/images/',
                FTP_CLIENT_USER: 'ws_ImagineWeb',
                FTP_CLIENT_PASSWORD: '9035-51109aefc7dd',
                FTP_CLIENT_HOST: 'ftp.stoletov.ru',
                FTP_CLIENT_PORT: 21
            }
        }
    ]
};
