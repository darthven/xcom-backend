module.exports = {
    apps: [
        {
            name: 'xcom',
            script: './lib/bin/index.js',
            watch: false,
            "log_date_format": "YYYY-MM-DD HH:mm Z"
        }
    ]
};
