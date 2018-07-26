#!/bin/sh

cd /home/ubuntu/db/test/

mysql -h rb-01.cgh9xag3iems.us-east-2.rds.amazonaws.com -P 3306 -u stokaboka_rdsdev -p < /home/ubuntu/db/test/employees.sql
mysql -h rb-01.cgh9xag3iems.us-east-2.rds.amazonaws.com -P 3306 -u stokaboka_rdsdev -p -t < /home/ubuntu/db/test/test_employees_md5.sql
cd sakila
mysql -h rb-01.cgh9xag3iems.us-east-2.rds.amazonaws.com -P 3306 -u stokaboka_rdsdev -p < /home/ubuntu/db/test/sakila/sakila-mv-schema.sql
mysql -h rb-01.cgh9xag3iems.us-east-2.rds.amazonaws.com -P 3306 -u stokaboka_rdsdev -p < /home/ubuntu/db/test/sakila/sakila-mv-data.sql

exit 0
