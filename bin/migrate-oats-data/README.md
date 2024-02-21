# Overview

This script is an ETL utility that imports data from the OATS system into the ALCS system. It can also perform a cleanup operation on previous ETL operations.

## Requirements

Python 3.6 or higher

### Mac OS

- Make sure you have homebrew installed if no install it first
- install postgresql on local machine `brew install postgresql`. You will need this for psycopg2
- export PATH="/usr/local/opt/python/libexec/bin:$PATH"
- `brew install python`
- install virtualenv `pip install virtualenv`
- in bin/migrate-oats-data folder init virtual env `virtualenv env`
- activate virtual env `source env/bin/activate`

## Installation

Install the required Python packages using pip:
`pip install -r requirements.txt`

## Usage

The following environment variables are required:

- DB_USER: Postgres database username
- DB_PASSWORD: Postgres database password
- DB_HOST: Postgres database host
- DB_PORT: Postgres database port
- DB_DATABASE: Postgres database name

These variables can be stored in the .env file.

To run the script, navigate to the directory containing the script and run the following command:

`python migrate.py [action]`
Where [action] is one of the following:

- import: Imports data from OATS into ALCS (default action)
- clean: Cleans up previous ETL operations

If you want to see a detailed description of the available arguments and options, run the script with the -h or --help flag.

### Post launch ETL

Pre-launch ETL command has been changed to:

`python migrate_initial.py [action]`

Post-launch ETL command now takes over migrate.py and is used as before

Commands for post-launch are stored in:

`menu/post_launch_commands`

ETLs created post launch are to be located in the post-launch folder of their directory i.e.

`applications/post_launch` or `noi/post-launch`


## Prod data obfuscation

Prerequisites:

- prod OATS postgres DB restored on local
- prod ALCS postgres DB restores on local. NOTE! The ALCS DB obfuscation covers only MVP BD structure, which is deployed at the time of the creation of alcs script!

### How to run:

- activate virtual env, the same way you would do it for starting etl,
- install python requirements `pip install -r requirements.txt`
- run data obfuscation `python migrate.py obfuscate`

## Fixing Public Visibility Issue

Applications imported from OATS will not properly display in the public search. The following hack can circumvent this issue:

```sql
UPDATE alcs.application a
SET date_received_all_items = CURRENT_TIMESTAMP
WHERE a.audit_created_by = 'oats_etl';
```

## Full DB backup and restore on local machine

### Prerequisites

- docker installed
- docker postgres container
- pg_restore and pg_dump installed locally
- IDE to browse DB

Full db restore steps on example of ALCS DEV environment:

- login to openshift using the oc command
- switch to dev : `oc project a5cf88-dev`
- port-forward dev : `oc port-forward  service/alcs-patroni 15432:5432`
- create dev db dump: `pg_dump -U postgres -h localhost -p 15432  -W -F t app > app_back.tar`  
  This command will ask for DEV DB password. The app_back.tar file will be approximately 1.3GB
- disconnect from dev
- start the local docker db container. The Postgres version should be 12.4
- make sure that you do not have db named "app" in your local postgres and
  create db app: `createdb -U postgres -h localhost -p 5432 -W app`
- restore dump from dev: `pg_restore -U postgres -h localhost -p 5432 -d app -F t -C -v < app_back.tar`
  NOTE: restore will finish with some warnings/errors related to the "readaccess" user that could be safely ignored.
- once restore is done check that alcs-obfuscated schema exists and the comment table has lorem ipsum in body column
