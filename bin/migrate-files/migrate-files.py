import os
from dotenv import load_dotenv
import cx_Oracle
import boto3
from tqdm import tqdm
import pickle

# Load environment variables from .env file
load_dotenv()

# Load the database connection secrets from environment variables
db_username = os.getenv("DB_USERNAME")
db_password = os.getenv("DB_PASSWORD")
db_dsn = os.getenv("DB_DSN")

# Connect to the Oracle database
conn = cx_Oracle.connect(
    user=db_username, password=db_password, dsn=db_dsn, encoding="UTF-8"
)

# Load the ECS connection secrets from environment variables
ecs_host = os.getenv("ECS_HOSTNAME")
ecs_bucket = os.getenv("ECS_BUCKET")
ecs_access_key = os.getenv("ECS_ACCESS_KEY")
ecs_secret_key = os.getenv("ECS_SECRET_KEY")

# Connect to S3
s3 = boto3.client(
    "s3",
    aws_access_key_id=ecs_access_key,
    aws_secret_access_key=ecs_secret_key,
    use_ssl=True,
    endpoint_url=ecs_host,
)

starting_document_id = 0
# Determine job resume status
if os.path.isfile('last-file.pickle'):
    with open('last-file.pickle', 'rb') as file:
        starting_document_id = pickle.load(file)

print('Starting applications from:', starting_document_id)

starting_planning_document_id = 0
# Determine job resume status
if os.path.isfile('last-planning-file.pickle'):
    with open('last-planning-file.pickle', 'rb') as file:
        starting_planning_document_id = pickle.load(file)
    #ignore imported files before failure
    starting_document_id = 999999

print('Starting planning_review from:', starting_planning_document_id)

starting_issue_document_id = 0
# Determine job resume status
if os.path.isfile('last-issue-file.pickle'):
    with open('last-issue-file.pickle', 'rb') as file:
        starting_issue_document_id = pickle.load(file)
    #ignore imported files before failure
    starting_document_id = 999999
    starting_planning_document_id = 999999
print('Starting issues from:', starting_issue_document_id)

# Get total number of files

cursor = conn.cursor()

try:
    cursor.execute ('SELECT COUNT(*) FROM OATS.OATS_DOCUMENTS WHERE dbms_lob.getLength(DOCUMENT_BLOB) > 0 AND ALR_APPLICATION_ID IS NOT NULL')
except cx_Oracle.Error as e:
    error, = e.args
    print(error.message)

application_count = cursor.fetchone()[0]
print('Count =', application_count)

# # Execute the SQL query to retrieve the BLOB data and key column
cursor.execute(f"""
SELECT DOCUMENT_ID, ALR_APPLICATION_ID, FILE_NAME, DOCUMENT_BLOB, DOCUMENT_CODE, DESCRIPTION, DOCUMENT_SOURCE_CODE, UPLOADED_DATE, WHEN_UPDATED, REVISION_COUNT, dbms_lob.getLength(DOCUMENT_BLOB) as LENGTH
FROM OATS.OATS_DOCUMENTS
WHERE dbms_lob.getLength(DOCUMENT_BLOB) > 0
AND DOCUMENT_ID > {starting_document_id}
ORDER BY DOCUMENT_ID ASC
""")

# Set the batch size
BATCH_SIZE = 10

# Track progress
documents_processed = 0
last_document_id = 0
max_file = 0

try:
    with tqdm(total=count, unit="file", desc="Uploading files to S3") as pbar:
        while True:
            # Fetch the next batch of BLOB data
            data = cursor.fetchmany(BATCH_SIZE)
            if not data:
                break
            # Upload the batch to S3 with a progress bar
            for document_id, application_id, filename, file, code, description, source, created, updated, revision, length in data:
                tqdm.write(f"{application_id}/{document_id}_{filename}")

                with tqdm(total=length, unit="B", unit_scale=True, desc=filename) as pbar2:
                    s3.upload_fileobj(file, ecs_bucket, f"migrate/application/{application_id}/{document_id}_{filename}",
                        Callback=lambda bytes_transferred: pbar2.update(bytes_transferred),)
                pbar.update(1)
                last_document_id = document_id
                documents_processed += 1
                max_file += 1
                if max_file > 4:
                    break
except Exception as e:
    print("Something went wrong:",e)
    print("Processed", documents_processed,  "files")
    
    # Set resume status in case of interuption
    with open('last-file.pickle', 'wb') as file:
        pickle.dump(last_document_id, file)
    
    cursor.close()
    conn.close()
    exit()

# Display results
print("Process complete: Successfully migrated", documents_processed, "files.")

# Close the database cursor and connection
# cursor.close()
# conn.close()

# cursor = conn.cursor()

try:
    cursor.execute ('SELECT COUNT(*) FROM OATS.OATS_DOCUMENTS WHERE dbms_lob.getLength(DOCUMENT_BLOB) > 0 AND PLANNING_REVIEW_ID IS NOT NULL')
except cx_Oracle.Error as e:
    error, = e.args
    print(error.message)

planning_review_count = cursor.fetchone()[0]
print('Count =', planning_review_count)

# # Execute the SQL query to retrieve the BLOB data and key column
cursor.execute(f"""
SELECT DOCUMENT_ID, PLANNING_REVIEW_ID, FILE_NAME, DOCUMENT_BLOB, DOCUMENT_CODE, DESCRIPTION, DOCUMENT_SOURCE_CODE, UPLOADED_DATE, WHEN_UPDATED, REVISION_COUNT, dbms_lob.getLength(DOCUMENT_BLOB) as LENGTH
FROM OATS.OATS_DOCUMENTS
WHERE dbms_lob.getLength(DOCUMENT_BLOB) > 0
AND DOCUMENT_ID > {starting_planning_document_id}
ORDER BY DOCUMENT_ID ASC
""")

# Set the batch size
BATCH_SIZE = 10

# Track progress
documents_processed = 0
last_planning_document_id = 0
max_file = 0

try:
    with tqdm(total=planning_review_count, unit="file", desc="Uploading files to S3") as pbar:
        while True:
            # Fetch the next batch of BLOB data
            data = cursor.fetchmany(BATCH_SIZE)
            if not data:
                break
            # Upload the batch to S3 with a progress bar
            for document_id, planning_review_id, filename, file, code, description, source, created, updated, revision, length in data:
                tqdm.write(f"{planning_review_id}/{document_id}_{filename}")

                with tqdm(total=length, unit="B", unit_scale=True, desc=filename) as pbar2:
                    s3.upload_fileobj(file, ecs_bucket, f"migrate/planning_review/{planning_review_id}/{document_id}_{filename}",
                        Callback=lambda bytes_transferred: pbar2.update(bytes_transferred),)
                pbar.update(1)
                last_planning_document_id = document_id
                documents_processed += 1
                max_file += 1
                if max_file > 4:
                    break
except Exception as e:
    print("Something went wrong:",e)
    print("Processed", documents_processed,  "files")
    
    # Set resume status in case of interuption
    with open('last-planning-file.pickle', 'wb') as file:
        pickle.dump(last_planning_document_id, file)
    
    cursor.close()
    conn.close()
    exit()

# Display results
print("Process complete: Successfully migrated", documents_processed, "files.")

# Close the database cursor and connection
# cursor.close()
# conn.close()

# cursor = conn.cursor()

try:
    cursor.execute ('SELECT COUNT(*) FROM OATS.OATS_DOCUMENTS WHERE dbms_lob.getLength(DOCUMENT_BLOB) > 0 AND ISSUE_ID IS NOT NULL')
except cx_Oracle.Error as e:
    error, = e.args
    print(error.message)

issue_count = cursor.fetchone()[0]
print('Count =', issue_count)

# # Execute the SQL query to retrieve the BLOB data and key column
cursor.execute(f"""
SELECT DOCUMENT_ID, ISSUE_ID, FILE_NAME, DOCUMENT_BLOB, DOCUMENT_CODE, DESCRIPTION, DOCUMENT_SOURCE_CODE, UPLOADED_DATE, WHEN_UPDATED, REVISION_COUNT, dbms_lob.getLength(DOCUMENT_BLOB) as LENGTH
FROM OATS.OATS_DOCUMENTS
WHERE dbms_lob.getLength(DOCUMENT_BLOB) > 0
AND DOCUMENT_ID > {starting_issue_document_id}
ORDER BY DOCUMENT_ID ASC
""")

# Set the batch size
BATCH_SIZE = 10

# Track progress
documents_processed = 0
last_issue_document_id = 0
max_file = 0

try:
    with tqdm(total=issue_count, unit="file", desc="Uploading files to S3") as pbar:
        while True:
            # Fetch the next batch of BLOB data
            data = cursor.fetchmany(BATCH_SIZE)
            if not data:
                break
            # Upload the batch to S3 with a progress bar
            for document_id, issue_id, filename, file, code, description, source, created, updated, revision, length in data:
                tqdm.write(f"{issue_id}/{document_id}_{filename}")

                with tqdm(total=length, unit="B", unit_scale=True, desc=filename) as pbar2:
                    s3.upload_fileobj(file, ecs_bucket, f"migrate/issue/{issue_id}/{document_id}_{filename}",
                        Callback=lambda bytes_transferred: pbar2.update(bytes_transferred),)
                pbar.update(1)
                last_issue_document_id = document_id
                documents_processed += 1
                max_file += 1
                if max_file > 4:
                    break
except Exception as e:
    print("Something went wrong:",e)
    print("Processed", documents_processed,  "files")
    
    # Set resume status in case of interuption
    with open('last-issue-file.pickle', 'wb') as file:
        pickle.dump(last_issue_document_id, file)
    
    cursor.close()
    conn.close()
    exit()

# Display results
print("Process complete: Successfully migrated", documents_processed, "files.")

# Close the database cursor and connection
cursor.close()
conn.close()