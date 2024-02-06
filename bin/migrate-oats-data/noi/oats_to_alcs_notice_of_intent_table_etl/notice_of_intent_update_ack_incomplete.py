from common import (
    setup_and_get_logger,
    BATCH_UPLOAD_SIZE
)
from db import inject_conn_pool
from psycopg2.extras import RealDictCursor, execute_batch

etl_name = "update_notice_of_intent_incomplete_date"
logger = setup_and_get_logger(etl_name)


@inject_conn_pool
def update_notice_of_intent_incomplete_date(conn=None, batch_size=BATCH_UPLOAD_SIZE):
    """
    This function is responsible for updating existing the notice of intent acknowledged_incomplete_date in ALCS.

    Args:
    conn (psycopg2.extensions.connection): PostgreSQL database connection. Provided by the decorator.
    batch_size (int): The number of items to process at once. Defaults to BATCH_UPLOAD_SIZE.
    """

    logger.info(f"Start {etl_name}")
    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        with open(
            "noi/sql/notice_of_intent_base/notice_of_intent_update_ack_incomplete_count.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            count_query = sql_file.read()
            cursor.execute(count_query)
            count_total = dict(cursor.fetchone())["count"]
        logger.info(f"Total Notice of intent data to be updated: {count_total}")

        failed_updates_count = 0
        successful_updates_count = 0
        last_file_number = 0

        with open(
            "noi/sql/notice_of_intent_base/notice_of_intent_update_ack_incomplete.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            query = sql_file.read()
            while True:
                cursor.execute(
                    f"""{query}
                      AND nois.file_number::bigint > '{last_file_number}' ORDER BY nois.file_number::bigint;"""
                )

                rows = cursor.fetchmany(batch_size)

                if not rows:
                    break
                try:
                    conditions_to_be_updated_count = len(rows)

                    _update_notice_of_intent_incomplete_date(conn, batch_size, cursor, rows)

                    successful_updates_count = (
                        successful_updates_count + conditions_to_be_updated_count
                    )
                    last_file_number = dict(rows[-1])["file_number"]

                    logger.debug(
                        f"retrieved/updated items count: {conditions_to_be_updated_count}; total successfully updated notice_of_intents so far {successful_updates_count}; last updated notice_of_intent: {last_file_number}"
                    )
                except Exception as err:
                    logger.exception(err)
                    conn.rollback()
                    failed_updates_count = count_total - successful_updates_count
                    last_file_number = last_file_number + 1

    logger.info(
        f"Finished {etl_name}: total amount of successful updates {successful_updates_count}, total failed updates {failed_updates_count}"
    )


def _update_notice_of_intent_incomplete_date(conn, batch_size, cursor, rows):
    data = _prepare_notice_of_intents_data(rows)

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
                    SET date_acknowledged_incomplete = %(date_to_insert)s
                    WHERE alcs.notice_of_intent.file_number = %(file_number)s;
    """
    return query


def _prepare_notice_of_intents_data(row_data_list):
    data_list = []
    date_to_insert = None
    for row in row_data_list:
        mapped_row = {
            "date_to_insert": row.get("effective_date"),
            "file_number": row.get("file_number"),
        }
        data_list.append(mapped_row)

    return data_list
