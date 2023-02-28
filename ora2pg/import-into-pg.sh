#!/bin/bash

if [[ -z "${PGPASSWORD}" ]]; then
read -p "Enter Postgres PWD: " var_value
    export "PGPASSWORD"="${var_value}"
fi

# Replace the following variables depending on environment
HOST=localhost
PORT=5433
DB_NAME=app
USER=postgres

# Run psql command to import SQL file
psql -h $HOST -p $PORT -U $USER -d $DB_NAME 