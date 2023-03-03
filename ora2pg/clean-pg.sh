#!/bin/bash

if [[ -z "${PGPASSWORD}" ]]; then
read -p "Enter Postgres PWD: " var_value
    export "PGPASSWORD"="${var_value}"
fi

# Replace the following variables with your own values
HOST=localhost
PORT=5433
DB_NAME=app
USER=postgres

read -r -p "Are you sure you want to drop the OATS schema? [Y/n] " response
if ! [[ "$response" =~ ^[Yy]$ ]]; then
  echo "Aborting"
  exit
fi


echo -n "Dropping OATS schema..."
psql -h $HOST -p $PORT -U $USER -d $DB_NAME -c "DROP schema OATS cascade;"
echo "DONE"