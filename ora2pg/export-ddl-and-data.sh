#!/bin/bash

if [[ -z "${ORACLE_PWD}" ]]; then
read -p "Enter Oracle PWD: " var_value
    export "ORACLE_PWD"="${var_value}"
fi

ora2pg -c ora2pg.conf -t TABLE -w $ORACLE_PWD -o ddl.sql
ora2pg -c ora2pg.conf -t COPY -w $ORACLE_PWD -o data.sql