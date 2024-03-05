from common import (
    setup_and_get_logger,
    BATCH_UPLOAD_SIZE,
    OATS_ETL_USER,
    add_timezone_and_keep_date_part,
    OatsToAlcsDocumentSourceCode,
)
from db import inject_conn_pool
from psycopg2.extras import RealDictCursor

etl_name = "import_srw_documents_from_oats"
logger = setup_and_get_logger(etl_name)

"""
    This script connects to postgress version of OATS DB and transfers data from OATS documents table to ALCS documents table.

    NOTE:
    Before performing document import you need to import SRWs from oats.
"""


@inject_conn_pool
def import_oats_srw_documents(conn=None, batch_size=BATCH_UPLOAD_SIZE):
    """
    function uses a decorator pattern @inject_conn_pool to inject a database connection pool to the function. It fetches the total count of documents and prints it to the console. Then, it fetches the documents to insert in batches using document IDs, constructs an insert query, and processes them.
    """
    logger.info(f"Start {etl_name}")
    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        with open(
            "documents/post_launch/sql/oats_documents_to_alcs_documents_count.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            count_query = sql_file.read()
            cursor.execute(count_query)
            # count_total = dict(cursor.fetchone())["count"]
            # cursor.fetchone()[0]
            total_count = dict(cursor.fetchone())["count"]
        logger.info(f"Total count of documents to transfer: {total_count}")

        failed_inserts_count = 0
        successful_inserts_count = 0
        last_document_id = 0

        with open(
            "documents/post_launch/sql/oats_documents_to_alcs_documents.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            documents_to_insert_sql = sql_file.read()
            while True:
                cursor.execute(
                    f"{documents_to_insert_sql} WHERE document_id > {last_document_id} ORDER BY document_id;"
                )
                rows = cursor.fetchmany(batch_size)
                if not rows:
                    break
                try:
                    documents_to_be_inserted_count = len(rows)

                    _insert_records(conn, cursor, rows)

                    last_document_id = dict(rows[-1])["document_id"]
                    successful_inserts_count = (
                        successful_inserts_count + documents_to_be_inserted_count
                    )

                    logger.debug(
                        f"retrieved/inserted items count: {documents_to_be_inserted_count}; total successfully inserted/updated documents so far {successful_inserts_count}; last inserted oats_document_id: {last_document_id}"
                    )
                except Exception as e:
                    conn.rollback()
                    logger.exception(f"Error {e}")
                    failed_inserts_count += len(rows)
                    last_document_id = last_document_id + 1

    logger.info(f"Total amount of successful inserts: {successful_inserts_count}")
    logger.info(f"Total amount of failed inserts: {failed_inserts_count}")


def _insert_records(conn, cursor, rows):
    number_of_rows_to_insert = len(rows)

    if number_of_rows_to_insert > 0:
        insert_query = _compile_insert_query(number_of_rows_to_insert)
        rows_to_insert = _prepare_data_to_insert(rows)
        cursor.execute(insert_query, rows_to_insert)
        conn.commit()


def _compile_insert_query(number_of_rows_to_insert):
    documents_to_insert = ",".join(["%s"] * number_of_rows_to_insert)
    return f"""
                        INSERT INTO alcs."document"(
                            oats_document_id, 
                            file_name, 
                            oats_application_id, 
                            audit_created_by, 
                            file_key, 
                            mime_type, 
                            tags, 
                            "system",
                            uploaded_at,
                            source           
                        )
                        VALUES{documents_to_insert}
                        ON CONFLICT (oats_document_id) DO UPDATE SET 
                            oats_document_id = EXCLUDED.oats_document_id, 
                            file_name = EXCLUDED.file_name, 
                            oats_application_id = EXCLUDED.oats_application_id, 
                            audit_created_by = EXCLUDED.audit_created_by, 
                            file_key = EXCLUDED.file_key, 
                            mime_type = EXCLUDED.mime_type,
                            tags = EXCLUDED.tags,
                            "system" = EXCLUDED."system",
                            uploaded_at = EXCLUDED.uploaded_at,
                            source = EXCLUDED.source;
    """


def _prepare_data_to_insert(rows):
    row_without_last_element = []
    for row in rows:
        mapped_row = _map_data(row)
        row_without_last_element.append(tuple(mapped_row.values()))

    return row_without_last_element


def _map_data(row):
    return {
        "oats_document_id": row["oats_document_id"],
        "file_name": row["file_name"],
        "oats_application_id": row["oats_application_id"],
        "audit_created_by": OATS_ETL_USER,
        "file_key": row["file_key"],
        "mime_type": row["mime_type"],
        "tags": row["tags"],
        "system": _map_system(row),
        "file_upload_date": _get_upload_date(row),
        "file_source": _get_document_source(row),
    }


def _map_system(row):
    who_created = row["who_created"]
    if who_created == "PROXY_OATS_LOCGOV":
        sys = "OATS_P"
    elif who_created == "PROXY_OATS_APPLICANT":
        sys = "OATS_P"
    else:
        sys = "OATS"
    return sys


def _get_upload_date(data):
    upload_date = data.get("uploaded_date", "")
    created_date = data.get("when_created", "")
    if upload_date:
        return add_timezone_and_keep_date_part(upload_date)
    else:
        return add_timezone_and_keep_date_part(created_date)


def _get_document_source(data):
    source = data.get("document_source_code", "")
    if source:
        source = str(OatsToAlcsDocumentSourceCode[source].value)

    return source


@inject_conn_pool
def document_clean(conn=None):
    logger.info("Start documents cleaning")
    with conn.cursor() as cursor:
        cursor.execute(
            f"DELETE FROM alcs.document WHERE audit_created_by = '{OATS_ETL_USER}' AND audit_created_at > '2024-02-08';"
        )
        conn.commit()
        logger.info(f"Deleted items count = {cursor.rowcount}")

    conn.commit()
