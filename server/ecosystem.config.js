module.exports = {
  apps: [
    {
      name: 'xcom',
      script: './lib/bin/index.js',
      watch: false,
      env: {
        NODE_ENV: 'production',
        PORT: 1340,
        ECOM_URL: 'http://ws.erkapharm.com:8990/ecom/hs/',
        ECOM_USER: 'IdEast',
        ECOM_PASS: 'KZMY5N',
        MONGO_URI: 'mongodb://localhost:27017',
        MONGO_DB: 'xcom-prod',
        IMAGE_FOLDER: '/var/www/xcom/static/images/'
      }
    }
  ]
};
