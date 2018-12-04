#!/usr/bin/env bash
trap exit SIGINT;
set -e

#
# Initial set up script
#

if [[ $# -eq 0 ]] ; then
    echo 'should specify mode [dev/prod]'
    exit 1
fi

mode=$1

npm install

npm run build
echo "build successful"

npm run db:init:${mode}
echo "db initialized"

npm run fs:init:${mode}
echo "filesystem initialized"

# start initial ecom sync
echo "starting initial ecom sync and database setup..."
npm run script:${mode} -- initialPipe
echo "ecom sync completed."

# schedule cron updates
echo "scheduling cron updates..."
npm run schedule:${mode}
echo "updates scheduled, xcom setup finished."

exit 0
