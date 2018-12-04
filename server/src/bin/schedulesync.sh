#!/usr/bin/env bash
set -e

#
# schedules ecom sync
#

if [[ $# -eq 0 ]] ; then
    echo 'should specify mode [dev/prod]'
    exit 1
fi

mode=$1

env_file=$([[ "$mode" == "dev" ]] && echo ".env" || echo ".env.prod")

function crontab_add(){
    if ! crontab -l | fgrep -q "$1"; then
        #write out current crontab
        temp_file=$(mktemp)
        crontab -l > temp_file || true
        #echo new cron into cron file
        echo "$1" >> temp_file
        #install new cron file
        crontab temp_file
        rm "$temp_file"
    fi
}

export -p > cron_env_${mode}.sh

crontab_add "SHELL=/bin/bash"

# every hour except a break from 3 am to 6 am
crontab_add "0 0,1,2,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23 * * * cd $PWD && source cron_env_$mode.sh && source $env_file && pm2 restart xcomStockUpdater || pm2 start npm --name 'xcomStockUpdater' --no-autorestart --log-date-format 'DD-MM-YYYY HH:mm:ss.SSS' -- run script:${mode} -- stocksPipe"

# every day at 2.45 am
crontab_add "45 02 * * * cd $PWD && source cron_env_$mode.sh && source $env_file && pm2 restart xcomDailyUpdater || pm2 start npm --name 'xcomDailyUpdater' --no-autorestart --log-date-format 'DD-MM-YYYY HH:mm:ss.SSS' -- run script:$mode -- dailyPipe"

echo "cron updates scheduled."

exit 0
