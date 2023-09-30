from db import inject_conn_pool
from common import (
    BATCH_UPLOAD_SIZE,
    setup_and_get_logger,
    log,
    log_start,
    OATS_ETL_USER,
)
from psycopg2.extras import execute_batch, RealDictCursor
import traceback

etl_name = "init_notice_of_intent_submissions"
logger = setup_and_get_logger(etl_name)


@inject_conn_pool
def init_notice_of_intent_submissions(conn=None, batch_size=BATCH_UPLOAD_SIZE):
    """
    This function is responsible for initializing the notice_of_intent_submission in ALCS.

    Args:
    conn (psycopg2.extensions.connection): PostgreSQL database connection. Provided by the decorator.
    batch_size (int): The number of items to process at once. Defaults to BATCH_UPLOAD_SIZE.
    """

    logger.info(f"Start {etl_name}")
    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        with open(
            "noi/sql/notice_of_intent_submission/notice_of_intent_submission_init_count.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            count_query = sql_file.read()
            cursor.execute(count_query)
            count_total = dict(cursor.fetchone())["count"]
        logger.info(f"Total Notice of Intent Submission data to insert: {count_total}")

        failed_inserts = 0
        successful_inserts_count = 0
        last_submission_id = 0

        with open(
            "noi/sql/notice_of_intent_submission/notice_of_intent_submission_init.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            submission_sql = sql_file.read()
            while True:
                cursor.execute(
                    f"{submission_sql} WHERE noig.alr_application_id > {last_submission_id} ORDER BY noig.alr_application_id;"
                )

                rows = cursor.fetchmany(batch_size)

                if not rows:
                    break
                try:
                    submissions_to_be_inserted_count = len(rows)

                    _insert_notice_of_intent_submissions(conn, batch_size, cursor, rows)

                    successful_inserts_count = (
                        successful_inserts_count + submissions_to_be_inserted_count
                    )
                    last_submission_id = dict(rows[-1])["alr_application_id"]

                    logger.debug(
                        f"retrieved/inserted items count: {submissions_to_be_inserted_count}; total successfully inserted submissions so far {successful_inserts_count}; last inserted alr_application_id: {last_submission_id}"
                    )
                except Exception as err:
                    conn.rollback()
                    logger.exception(err)
                    failed_inserts = count_total - successful_inserts_count
                    last_submission_id = last_submission_id + 1

    logger.info(
        f"Finished {etl_name}: total amount of successful inserts {successful_inserts_count}, total failed inserts {failed_inserts}"
    )


def _insert_notice_of_intent_submissions(conn, batch_size, cursor, rows):
    """ """
    query = _get_insert_query()
    parsed_data_list = _prepare_oats_alr_applications_data(rows)

    if len(parsed_data_list) > 0:
        execute_batch(cursor, query, parsed_data_list, page_size=batch_size)

    conn.commit()


def _get_insert_query():
    query = f"""
                INSERT INTO alcs.notice_of_intent_submission (
                    file_number,
                    local_government_uuid,
                    type_code,
                    applicant,
                    is_draft,
                    audit_created_by
                )
                VALUES (
                    %(file_number)s,
                    %(local_government_uuid)s,
                    %(type_code)s,
                    %(applicant)s,
                    false,
                    '{OATS_ETL_USER}'
                )
    """
    return query


def _prepare_oats_alr_applications_data(row_data_list):
    data_list = []
    for row in row_data_list:
        data_list.append(dict(row))
    return data_list


@inject_conn_pool
def clean_notice_of_intent_submissions(conn=None):
    logger.info("Start notice_of_intent_submissions cleaning")
    with conn.cursor() as cursor:
        cursor.execute(
            f"DELETE FROM alcs.notice_of_intent_submission nois WHERE nois.audit_created_by = '{OATS_ETL_USER}'"
        )
        logger.info(f"Deleted items count = {cursor.rowcount}")

    conn.commit()
