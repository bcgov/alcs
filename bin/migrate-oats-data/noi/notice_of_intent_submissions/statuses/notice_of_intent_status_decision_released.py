from common import setup_and_get_logger
from db import inject_conn_pool
from psycopg2.extras import RealDictCursor


etl_name = "process_alcs_notice_of_intent_decision_released_status"
logger = setup_and_get_logger(etl_name)


@inject_conn_pool
def process_alcs_notice_of_intent_decision_released_status(conn=None):
    """
    This function is responsible for populating Decision Released status of Notice of Intent in ALCS.
    This function does not use batch since update happens in scope of the same schema

    Args:
    conn (psycopg2.extensions.connection): PostgreSQL database connection. Provided by the decorator.
    """

    logger.info(f"Start {etl_name}")
    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        with open(
            "noi/sql/notice_of_intent_submission/statuses/decision_released/notice_of_intent_status_decision_released_count.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            count_query = sql_file.read()
            cursor.execute(count_query)
            count_total = dict(cursor.fetchone())["count"]
        logger.info(f"Total Notice of Intents data to update: {count_total}")

        successful_updates_count = 0
        failed_updates = 0

        with open(
            "noi/sql/notice_of_intent_submission/statuses/decision_released/notice_of_intent_status_decision_released.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            update_sql = sql_file.read()

            try:
                cursor.execute(update_sql)
                conn.commit()

                successful_updates_count = cursor.rowcount

            except Exception as err:
                # this is NOT going to be caused by actual data update failure. This code is only executed when the code error appears or connection to DB is lost
                logger.exception(err)
                conn.rollback()
                failed_updates = count_total - successful_updates_count

    logger.info(
        f"Finished {etl_name}: total amount of successful updates {successful_updates_count}, total failed updates {failed_updates}"
    )
