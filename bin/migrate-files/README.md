# Oracle document migration script

This script retrieves files from an Oracle SQL database stored in a BLOB column and upload them to an Dell ECS S3 bucket.

## Prerequisites

- cx_Oracle library: To connect to the Oracle database and retrieve the BLOB data.
- boto3 library: To connect to the S3 bucket and upload the files.
- python-dotenv: To load the environment variables from a .env file.
- tqdm library: To display a progress bar when uploading the files.

## Usage

Create a .env file in the same directory of the script.
Add the following environment variables to the .env file:

```
DB_USERNAME=
DB_PASSWORD=
DB_DSN=
ECS_HOSTNAME=https://nrs.objectstore.gov.bc.ca/
ECS_BUCKET=ckbdwh
ECS_ACCESS_KEY=
ECS_SECRET_KEY=

```

Run the script `python migrate-files.py`
