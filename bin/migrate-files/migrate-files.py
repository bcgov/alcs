import os
import cx_Oracle
import boto3
import pickle
from config import (
    db_host,
    db_port,
    db_service_name,
    db_username,
    db_password,
    ecs_host,
    ecs_access_key,
    ecs_secret_key,
)
from application_docs import import_application_docs
from planning_docs import import_planning_review_docs
from issue_docs import import_issue_docs

# Connect to the Oracle database
# db_path = os.getenv("DB_PATH") # only necessary if running on M1
db_dsn = cx_Oracle.makedsn(db_host, db_port, service_name=db_service_name)

# cx_Oracle.init_oracle_client(lib_dir=db_path) # only necessary if running on M1
conn = cx_Oracle.connect(
    user=db_username, password=db_password, dsn=db_dsn, encoding="UTF-8"
)

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
if os.path.isfile("last-file.pickle"):
    with open("last-file.pickle", "rb") as file:
        starting_document_id = pickle.load(file)
    print("Starting applications from:", starting_document_id)

starting_planning_document_id = 0
# Determine job resume status
if os.path.isfile("last-planning-file.pickle"):
    with open("last-planning-file.pickle", "rb") as file:
        starting_planning_document_id = pickle.load(file)
    print("Starting planning_reviews from:", starting_planning_document_id)

starting_issue_document_id = 0
# Determine job resume status
if os.path.isfile("last-issue-file.pickle"):
    with open("last-issue-file.pickle", "rb") as file:
        starting_issue_document_id = pickle.load(file)
    print("Starting issues from:", starting_issue_document_id)

cursor = conn.cursor()

# Set batch size
batch_size = 1000

import_application_docs(batch_size, cursor, conn, s3)

import_planning_review_docs(batch_size, cursor, conn, s3)

import_issue_docs(batch_size, cursor, conn, s3)

print("File upload complete, closing connection")

# Close the database cursor and connection
cursor.close()
conn.close()
