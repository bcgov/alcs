from common import OATS_ETL_USER, setup_and_get_logger
from db import inject_conn_pool
from psycopg2.extras import RealDictCursor

etl_name = "init_notice_of_intent_statuses"
logger = setup_and_get_logger(etl_name)


@inject_conn_pool
def init_notice_of_intent_statuses(conn=None):
    """
    This function is responsible for initializing notice of intent statuses.
    Initializing means inserting status_to_submission record without the effective_date.

    Args:
    conn (psycopg2.extensions.connection): PostgreSQL database connection. Provided by the decorator.
    batch_size (int): The number of items to process at once. Defaults to BATCH_UPLOAD_SIZE.
    """

    logger.info(f"Start {etl_name}")
    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        with open(
            "noi/sql/notice_of_intent_submission/statuses/init_notice_of_intent_submission_statuses_count.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            count_query = sql_file.read()
            cursor.execute(count_query)
            count_total = dict(cursor.fetchone())["count"]
        logger.info(f"Total Notice of Intents data to insert: {count_total}")

        failed_inserts = 0
        successful_inserts_count = 0
        last_application_id = 0

        with open(
            "noi/sql/notice_of_intent_submission/statuses/init_notice_of_intent_submission_statuses.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            query = sql_file.read()

            try:
                cursor.execute(query)
                conn.commit()
                successful_inserts_count = cursor.rowcount
            except Exception as err:
                logger.exception()
                conn.rollback()
                failed_inserts = count_total - successful_inserts_count
                last_application_id = last_application_id + 1

    logger.info(
        f"Finished {etl_name}: total amount of successful inserts {successful_inserts_count}, total failed updates {failed_inserts}"
    )


@inject_conn_pool
def clean_notice_of_intent_submission_statuses(conn=None):
    logger.info("Start init_notice_of_intent_statuses cleaning")
    with conn.cursor() as cursor:
        cursor.execute(
            f"""DELETE FROM alcs.notice_of_intent_submission_to_submission_status noi_st 
                USING alcs.notice_of_intent_submission nois
                WHERE noi_st.submission_uuid = nois.uuid AND nois.audit_created_by = '{OATS_ETL_USER}';"""
        )
        logger.info(f"Deleted items count = {cursor.rowcount}")

    conn.commit()
