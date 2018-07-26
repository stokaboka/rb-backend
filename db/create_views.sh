#!/bin/sh

cd /home/ubuntu/db/

mysql -h rb-01.cgh9xag3iems.us-east-2.rds.amazonaws.com -P 3306 -u stokaboka_rdsdev -p < /home/ubuntu/db/dept_manager_view.sql

exit 0
