#!/usr/bin/env bash
set -e

#
# schedules ecom sync
#

mode=$1

# every hour except a break from 3 am to 5 am
pm2 start npm --cron "0 0 0,1,2,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23 * *" --name "xcomStockUpdater" --log-date-format 'DD-MM HH:mm:ss.SSS' -- run sync:${mode} -- stocksPipe

# every day at 2.45 am
pm2 start npm --name "xcomDailyUpdater" --cron "0 45 2 * *" --log-date-format 'DD-MM HH:mm:ss.SSS' -- run sync:${mode} -- dailyPipe

exit 0
