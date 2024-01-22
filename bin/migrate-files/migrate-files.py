import cx_Oracle
import boto3
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
import argparse
import sys


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
cursor = conn.cursor()

# Set batch size
batch_size = 1000


def main(args):
    args = _parse_command_line_args(args)

    start_document_id = int(args.start_document_id)
    end_document_id = int(args.end_document_id)
    last_imported_document_id = int(args.last_imported_document_id)

    if args.document_type == "application":
        import_application_docs(
            batch_size,
            cursor,
            conn,
            s3,
            start_document_id,
            end_document_id,
            last_imported_document_id,
        )
    elif args.document_type == "planning":
        import_planning_review_docs(batch_size, cursor, conn, s3)
    elif args.document_type == "issue":
        import_issue_docs(batch_size, cursor, conn, s3)

    print("File upload complete, closing connection")

    # Close the database cursor and connection
    cursor.close()
    conn.close()


def _parse_command_line_args(args):
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "document_type",
        choices=["application", "planning", "issue"],
        help="Document type to be processed",
    )
    parser.add_argument(
        "--start_document_id",
        default=0,
        help="Integer DOCUMENT_ID from Oracle to start from (is not included into upload)",
    )
    parser.add_argument(
        "--end_document_id",
        default=0,
        help="Integer DOCUMENT_ID from Oracle to stop when reached (included into upload)",
    )
    parser.add_argument(
        "--last_imported_document_id",
        default=0,
        help="Integer DOCUMENT_ID from Oracle to stop when reached (included into upload)",
    )
    args = parser.parse_args(args)
    return args


if __name__ == "__main__":
    main(sys.argv[1:])
