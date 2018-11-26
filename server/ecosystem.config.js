module.exports = {
    apps: [
        {
            name: 'xcom',
            script: './lib/bin/index.js',
            watch: false,
            "log_date_format": "DD-MM-YYYY HH:mm:ss.SSS"
        }
    ]
};
