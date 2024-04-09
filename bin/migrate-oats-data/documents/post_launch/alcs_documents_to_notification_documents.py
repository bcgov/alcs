from common import (
    setup_and_get_logger,
    BATCH_UPLOAD_SIZE,
    OATS_ETL_USER,
)
from db import inject_conn_pool
from psycopg2.extras import RealDictCursor

etl_name = "link_srw_documents_from_alcs"
logger = setup_and_get_logger(etl_name)


@inject_conn_pool
def link_srw_documents(conn=None, batch_size=BATCH_UPLOAD_SIZE):
    """
    This script connects to postgress version of OATS DB and links data from ALCS documents to ALCS notification_document table.

    NOTE:
    Before performing document import you need to import SRWs and SRW documents.
    function uses a decorator pattern @inject_conn_pool to inject a database connection pool to the function. It fetches the total count of documents and prints it to the console. Then, it fetches the documents to insert in batches using document IDs, constructs an insert query, and processes them.
    """
    logger.info(f"Start {etl_name}")
    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        with open(
            "documents/post_launch/sql/alcs_documents_to_notification_documents_count.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            count_query = sql_file.read()
            cursor.execute(count_query)
            total_count = dict(cursor.fetchone())["count"]
        logger.info(f"Total count of documents to transfer: {total_count}")

        failed_inserts_count = 0
        successful_inserts_count = 0
        last_document_id = 0

        with open(
            "documents/post_launch/sql/alcs_documents_to_notification_documents.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            documents_to_insert_sql = sql_file.read()
            while True:
                cursor.execute(
                    f"{documents_to_insert_sql} WHERE oats_document_id > {last_document_id} ORDER BY oats_document_id;"
                )
                rows = cursor.fetchmany(batch_size)
                if not rows:
                    break
                try:
                    documents_to_be_inserted_count = len(rows)

                    _insert_records(conn, cursor, rows)

                    last_document_id = dict(rows[-1])["oats_document_id"]
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
                        INSERT INTO alcs.notification_document(
                            notification_uuid,
                            document_uuid,
                            type_code,
                            visibility_flags,
                            oats_document_id,
                            oats_application_id,
                            audit_created_by,
                            survey_plan_number,
                            control_number,
                            description           
                        )
                        VALUES{documents_to_insert}
                        ON CONFLICT (oats_document_id, oats_application_id) DO UPDATE SET 
                            notification_uuid = EXCLUDED.notification_uuid, 
                            document_uuid = EXCLUDED.document_uuid, 
                            type_code = EXCLUDED.type_code,
                            visibility_flags = EXCLUDED.visibility_flags,
                            audit_created_by = EXCLUDED.audit_created_by,
                            survey_plan_number = EXCLUDED.survey_plan_number,
                            control_number = EXCLUDED.control_number,
                            description = EXCLUDED.description;
    """


def _prepare_data_to_insert(rows):
    row_without_last_element = []
    for row in rows:
        mapped_row = _map_data(row)
        row_without_last_element.append(tuple(mapped_row.values()))

    return row_without_last_element


def _map_data(row):
    return {
        "notification_uuid": row["notification_uuid"],
        "document_uuid": row["document_uuid"],
        "type_code": row["type_code"],
        "visibility_flags": row["visibility_flags"],
        "oats_document_id": row["oats_document_id"],
        "oats_application_id": row["oats_application_id"],
        "audit_created_by": OATS_ETL_USER,
        "plan_number": row["plan_no"],
        "control_number": row["control_no"],
        "description": row["description"],
    }


@inject_conn_pool
def clean_notification_documents(conn=None):
    logger.info("Start documents cleaning")
    with conn.cursor() as cursor:
        cursor.execute(
            f"DELETE FROM alcs.notification_document WHERE audit_created_by = '{OATS_ETL_USER}';"
        )
        conn.commit()
        logger.info(f"Deleted items count = {cursor.rowcount}")
