# Oracle document migration script

This is a Python script for uploading files from the OATS database to the Dell ECS object storage service.

The files are uploaded in the format `/migrate/application||issue||planning_review/{application_id}||{issue_id}||{planning_review_id}/{document_id}_{filename}` where:

- `application_id` is the associated OATS application ID
- `issue_id` is the associated OATS issue ID
- `planning_review_id` is the associated OATS planning_review ID
- `document_id` is the primary key from the documents table
- `filename` is the filename metadata from the documents table

## Libraries Used

os: used to interact with the file system  
dotenv: used to load environment variables from the .env file  
cx_Oracle: used to interact with the Oracle database  
boto3: used to interact with Amazon S3  
tqdm: used to show progress bars during the file upload process

# Usage

## Prerequisites

The following environment variables are required:

DB_HOST
DB_PORT
DB_SERVICE_NAME
DB_USERNAME: Oracle database username  
DB_PASSWORD: Oracle database password  
DB_DSN: Oracle database service name  
ECS_HOSTNAME: Dell ECS S3 hostname  
ECS_BUCKET: Dell ECS bucket name  
ECS_ACCESS_KEY: Dell ECS access key  
ECS_SECRET_KEY: Dell ECS secret key

Create .env file in ./migrate-files/ and populate listed values there

## High level description of transport process

Import queries Oracle DB and uploads blob column(binary data that represents file) to DELL ECS. The querying of DB is done based on the file type: application, planning review and issue. Each file type has a custom query that reads corresponding data. The upload is done in the following steps:

1. find the maximum file size
2. add 3MB to it as data reserve - batch size cap
3. use the 'batch size cap' with the document count batch (limit the count of documents to be read in one transaction from DB)
4. read the data using the limit declared in step 3
5. if import fails:
   1. if any document from import fails record it to file and stop the process
   2. the source of the issue that caused the import to fail will need to be addressed manually
   3. restart the import. Import records the last successful file upload and will automatically restart from where it left

TIP: All 3 imports could be started in separate terminals at the same time.

## Arm64 quirks

### If running on M1:

DB_PATH: Path to oracle instant client driver folder
example `DB_PATH=/Users/user/Downloads/instantclient_19_8`

Force run python in emulation mode and reinstall requirements
`python3-intel64 -m pip install -r requirements.txt`

## Running the Script

To run the script, run the following command:
2023-09-14 12:26:19_last_imported_application_file

```sh
# To start application document import
python migrate-files.py application
python migrate-files.py application --start_document_id=500240 --end_document_id=505260 --last_imported_document_id=500475
```

Application document import supports running multiple terminals at the same time with specifying baches of data to import.

```
--- SQL ---
-- use following sql to determine the import batch size.
WITH documents_with_cumulative_file_size AS (
    SELECT
    ROW_NUMBER() OVER(
        ORDER BY DOCUMENT_ID ASC
    ) row_num,
    DOCUMENT_ID,
    ALR_APPLICATION_ID,
    FILE_NAME
FROM
    OATS.OATS_DOCUMENTS
WHERE
    dbms_lob.getLength(DOCUMENT_BLOB) > 0
    AND ALR_APPLICATION_ID IS NOT NULL
ORDER BY
    DOCUMENT_ID ASC
)
    SELECT * FROM documents_with_cumulative_file_size
    WHERE row_num = 10000
```

```sh
# start_document_id - starting document id of batch; end_document_id - end document id of batch; last_imported_document_id - the last successfully imported file id of batch. Could be found in [dateTime]_last_imported_application_file.txt or leave it empty and it defaults to 0.

python migrate-files.py application --start_document_id=500240 --end_document_id=505260 --last_imported_document_id=500475

```

```sh
# to start planning review document import
python migrate-files.py planning
```

```sh
# to start issue document import
python migrate-files.py issue
```

M1:

```sh
# to start application document import
python3-intel64 migrate-files.py application
```

```sh
# to start planning review document import
python3-intel64 migrate-files.py planning
```

```sh
# to start issue document import
python3-intel64 migrate-files.py issue
```

The script will start uploading files from the Oracle database to DELL ECS. The upload progress will be displayed in a progress bar. For Planning and Issues documents the script will also save the last uploaded document id, so the upload process can be resumed from where it left off in case of any interruption. For Application documents import it is responsibility of whoever is running the process to specify "last_imported_document_id"
