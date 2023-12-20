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
