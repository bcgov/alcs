from common import (
    BATCH_UPLOAD_SIZE,
    OATS_ETL_USER,
    setup_and_get_logger,
)
from db import inject_conn_pool
from psycopg2.extras import RealDictCursor

from .data_insert import (
    get_direction_data,
    get_soil_data,
    get_subdiv_data,
    insert_app_sub_records,
)

etl_name = "process_alcs_app_submissions"
logger = setup_and_get_logger(etl_name)


@inject_conn_pool
def process_alcs_app_submissions(conn=None, batch_size=BATCH_UPLOAD_SIZE):
    """
    This function is responsible for processing app_submissions in batches, updating records in the alcs.application_submissions table.

    Args:
    conn (psycopg2.extensions.connection): PostgreSQL database connection. Provided by the decorator.
    batch_size (int): The number of items to process at once. Defaults to BATCH_UPLOAD_SIZE.
    """
    logger.info(f"Start {etl_name}")
    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        with open(
            "applications/submissions/sql/app_submission_count.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            count_query = sql_file.read()
            cursor.execute(count_query)
            count_total = dict(cursor.fetchone())["count"]
        logger.info(f"Total Application Submission data to insert: {count_total}")

        failed_inserts = 0
        successful_inserts_count = 0
        last_submission_id = 0

        with open(
            "applications/submissions/sql/app_submission.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            submission_sql = sql_file.read()
            while True:
                cursor.execute(
                    f"{submission_sql} WHERE acg.alr_application_id > {last_submission_id} ORDER BY acg.alr_application_id;"
                )

                rows = cursor.fetchmany(batch_size)

                if not rows:
                    break
                try:
                    direction_data = get_direction_data(rows, cursor)
                    subdiv_data = get_subdiv_data(rows, cursor)
                    soil_data = get_soil_data(rows, cursor)

                    submissions_to_be_inserted_count = len(rows)

                    insert_app_sub_records(
                        conn,
                        batch_size,
                        cursor,
                        rows,
                        direction_data,
                        subdiv_data,
                        soil_data,
                    )

                    successful_inserts_count = (
                        successful_inserts_count + submissions_to_be_inserted_count
                    )
                    last_submission_id = dict(rows[-1])["alr_application_id"]

                    logger.debug(
                        f"retrieved/inserted items count: {submissions_to_be_inserted_count}; total successfully inserted submissions so far {successful_inserts_count}; last inserted application_id: {last_submission_id}"
                    )
                except Exception as err:
                    logger.exception()
                    conn.rollback()
                    failed_inserts = count_total - successful_inserts_count
                    last_submission_id = last_submission_id + 1

    logger.info(f"Total amount of successful inserts: {successful_inserts_count}")
    logger.info(f"Total failed inserts: {failed_inserts}")


@inject_conn_pool
def clean_application_submission(conn=None):
    logger.info("Start application_submission cleaning")
    with conn.cursor() as cursor:
        logger.debug("Start application_submission cleaning")
        cursor.execute(
            f"DELETE FROM alcs.application_submission a WHERE a.audit_created_by = '{OATS_ETL_USER}'"
        )
        logger.info(f"Deleted items count = {cursor.rowcount}")

    conn.commit()
