# Overview

This script is an ETL utility that imports data from the NRIS system into the ALCS system. It can also perform a cleanup operation on previous ETL operations.

## Requirements

Python 3.14 or higher

### Mac OS

- Make sure you have homebrew installed if no install it first
- Install postgresql on local machine `brew install postgresql`. You will need this for psycopg2
- `brew install python`
- In `bin/migrate-nris-data` folder, init a virtual env: `python -m venv .venv`
- Activate virtual env `source .venv/bin/activate`

## Installation

Install the required Python packages using pip:
`pip install -r requirements.txt`

## Usage

The following environment variables are required:

- `DB_USER`: Postgres database username
- `DB_PASSWORD`: Postgres database password
- `DB_HOST`: Postgres database host
- `DB_PORT`: Postgres database port
- `DB_DATABASE`: Postgres database name

These variables can be stored in the .env file.

To run the script, navigate to the directory containing the script and run the following command:

`python migrate.py [action] [table_1] [table_2] ...`

If you want to see a detailed description of the available arguments and options, run the script with the -h or --help flag.
