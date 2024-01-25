from common import (
    setup_and_get_logger,
    add_timezone_and_keep_date_part,
    BATCH_UPLOAD_SIZE
)
from db import inject_conn_pool
from psycopg2.extras import RealDictCursor, execute_batch

etl_name = "update_notice_of_intent_created_date"
logger = setup_and_get_logger(etl_name)


@inject_conn_pool
def update_noi_created_date(conn=None, batch_size=BATCH_UPLOAD_SIZE):
    """
    This function is responsible for updating existing the notice_of_intent created_at_date in ALCS.

    Args:
    conn (psycopg2.extensions.connection): PostgreSQL database connection. Provided by the decorator.
    batch_size (int): The number of items to process at once. Defaults to BATCH_UPLOAD_SIZE.
    """

    logger.info(f"Start {etl_name}")
    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        with open(
            "noi/sql/notice_of_intent_base/notice_of_intent_created_date_update_count.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            count_query = sql_file.read()
            cursor.execute(count_query)
            count_total = dict(cursor.fetchone())["count"]
        logger.info(f"Total Notice of Intent data to be updated: {count_total}")

        failed_updates_count = 0
        successful_updates_count = 0
        last_application_id = 0

        with open(
            "noi/sql/notice_of_intent_base/notice_of_intent_created_date_update.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            query = sql_file.read()
            while True:
                cursor.execute(
                    f"""{query}
                      WHERE oaa.alr_application_id > {last_application_id} ORDER BY oaa.alr_application_id;"""
                )

                rows = cursor.fetchmany(batch_size)

                if not rows:
                    break
                try:
                    conditions_to_be_updated_count = len(rows)

                    _update_notice_of_intent_created_at_date(conn, batch_size, cursor, rows)

                    successful_updates_count = (
                        successful_updates_count + conditions_to_be_updated_count
                    )
                    last_application_id = dict(rows[-1])["alr_application_id"]

                    logger.debug(
                        f"retrieved/updated items count: {conditions_to_be_updated_count}; total successfully updated notice of intents so far {successful_updates_count}; last updated notice of intent: {last_application_id}"
                    )
                except Exception as err:
                    logger.exception(err)
                    conn.rollback()
                    failed_updates_count = count_total - successful_updates_count
                    last_application_id = last_application_id + 1

    logger.info(
        f"Finished {etl_name}: total amount of successful updates {successful_updates_count}, total failed updates {failed_updates_count}"
    )


def _update_notice_of_intent_created_at_date(conn, batch_size, cursor, rows):
    data = _prepare_oats_alr_notice_of_intents_data(rows)

    if len(data) > 0:
        execute_batch(
            cursor,
            _get_update_query(),
            data,
            page_size=batch_size,
        )

    conn.commit()


def _get_update_query():
    query = f"""
                 UPDATE alcs.notice_of_intent
                    SET created_at = %(date_to_insert)s
                    WHERE alcs.notice_of_intent.file_number = %(alr_application_id)s::TEXT;
    """
    return query


def _prepare_oats_alr_notice_of_intents_data(row_data_list):
    data_list = []
    date_to_insert = None
    for row in row_data_list:
        if row.get("created_date"):
            date_to_insert = row.get("created_date")
        else: 
            date_to_insert = row.get("when_created")
        mapped_row = {
            "date_to_insert": add_timezone_and_keep_date_part(date_to_insert),
            "alr_application_id": row.get("alr_application_id"),
        }
        data_list.append(mapped_row)

    return data_list
