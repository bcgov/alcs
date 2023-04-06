# Oracle document migration script

This is a Python script for uploading files from the OATS database to the Dell ECS object storage service.

The files are uploaded in the format `/migrate/{application_id}/{document_id}_{filename}` where:

- `application_id` is the associated OATS application ID
- `document_id` is the primary key from the documents table
- `filename` is the filename metadata from the documents table

## Libraries Used

os: used to interact with the file system  
dotenv: used to load environment variables from the .env file  
cx_Oracle: used to interact with the Oracle database  
boto3: used to interact with Amazon S3  
tqdm: used to show progress bars during the file upload process  
pickle: used to store the last uploaded document id, so the upload process can be resumed from where it left off.

# Usage

## Prerequisites

The following environment variables are required:

DB_USERNAME: Oracle database username  
DB_PASSWORD: Oracle database password  
DB_DSN: Oracle database DSN  
ECS_HOSTNAME: Dell ECS S3 hostname  
ECS_BUCKET: Dell ECS bucket name  
ECS_ACCESS_KEY: Dell ECS access key  
ECS_SECRET_KEY: Dell ECS secret key  
These variables can be stored in the .env file.

## Running the Script

To run the script, run the following command:

`python migrate-files.py`

The script will start uploading files from the Oracle database to DELL ECS. The upload progress will be displayed in a progress bar. The script will also save the last uploaded document id, so the upload process can be resumed from where it left off in case of any interruption.
