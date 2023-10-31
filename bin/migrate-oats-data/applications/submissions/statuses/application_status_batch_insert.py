from common import OATS_ETL_USER, setup_and_get_logger, BATCH_UPLOAD_SIZE
from db import inject_conn_pool
from psycopg2.extras import RealDictCursor, execute_batch
from .application_status_type_code import *

etl_name = "init_application_statuses_batch"
logger = setup_and_get_logger(etl_name)


@inject_conn_pool
def batch_application_statuses(conn=None, batch_size=BATCH_UPLOAD_SIZE):
    print("enter sandman")
    """
    This function is responsible for initializing application statuses.
    Initializing means inserting status_to_submission record without the effective_date.

    Args:
    conn (psycopg2.extensions.connection): PostgreSQL database connection. Provided by the decorator.
    batch_size (int): The number of items to process at once. Defaults to BATCH_UPLOAD_SIZE.
    """
    logger.info(f"Start {etl_name}")
    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        with open(
            "applications/submissions/sql/statuses/init_app_submission_status_count.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            count_query = sql_file.read()
            cursor.execute(count_query)
            count_total = dict(cursor.fetchone())["count"]
        logger.info(f"Total Application data to insert: {count_total}")
        print(count_total)
        app_status_type = get_app_status_type(cursor)
        app_status_count = get_app_status_count(cursor)
        print(app_status_count, app_status_type)
        failed_inserts = 0
        successful_inserts_count = 0
        last_application_id = 0
        # mod_batch allows batching to work at the closest integer division of 12 which is the number of unique status types in alcs applications
        mod_batch = batch_size // 12
        mod_batch = mod_batch * 12
        with open(
            "applications/submissions/sql/statuses/init_app_submission_status_batch.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            query = sql_file.read()
            while True:
                cursor.execute(
                    f"{query} WHERE asup.alr_application_id > {last_application_id} ORDER by asup.alr_application_id;"
                )
                rows = cursor.fetchmany(mod_batch)
                if not rows:
                    break
                try:
                    applications_to_be_inserted_count = len(rows)
                    insert_data = make_rows(app_status_type, rows)
                    page_length = len(insert_data)
                    _get_insert_query(cursor, insert_data)
                    conn.commit()
                    last_application_id = dict(rows[-1])["alr_application_id"]
                    successful_inserts_count = (
                        successful_inserts_count + applications_to_be_inserted_count
                    )

                    logger.info(
                        f"retrieved/inserted items count: {applications_to_be_inserted_count}; total successfully inserted/updated applications so far {successful_inserts_count}; last inserted applidation_id: {last_application_id}"
                    )
                except Exception as err:
                    logger.exception()
                    conn.rollback()
                    failed_inserts = count_total - successful_inserts_count
                    last_application_id = last_application_id + 1

    logger.info(
        f"Finished {etl_name}: total amount of successful inserts {successful_inserts_count}, total failed updates {failed_inserts}"
    )


def _get_insert_query(cursor, data):
    data_rows = []
    for row in data:
        print(len(data_rows))
        execute_batch(
            cursor,
            _insert_query(),
            data_rows,
            page_size=len(data_rows),
        )


def _insert_query():
    query = """
                INSERT INTO alcs.application_submission_to_submission_status (
                    submission_uuid,
                    status_type_code
                )
                VALUES (
                    %(submission_uuid)s,
                    %(status_type_code)s
                )
    """
    return query
