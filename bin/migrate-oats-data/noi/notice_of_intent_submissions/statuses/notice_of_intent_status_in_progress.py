from common import (
    BATCH_UPLOAD_SIZE,
    setup_and_get_logger,
    add_timezone_and_keep_date_part,
    set_time,
)
from db import inject_conn_pool
from psycopg2.extras import RealDictCursor, execute_batch

etl_name = "process_alcs_notice_of_intent_in_progress_status"
logger = setup_and_get_logger(etl_name)


@inject_conn_pool
def process_alcs_notice_of_intent_in_progress_status(
    conn=None, batch_size=BATCH_UPLOAD_SIZE
):
    """
    This function is responsible for populating In Progress status of Notice of Intent in ALCS.

    Args:
    conn (psycopg2.extensions.connection): PostgreSQL database connection. Provided by the decorator.
    batch_size (int): The number of items to process at once. Defaults to BATCH_UPLOAD_SIZE.
    """

    logger.info(f"Start {etl_name}")
    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        with open(
            "noi/sql/notice_of_intent_submission/statuses/in_progress/notice_of_intent_status_in_progress_count.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            count_query = sql_file.read()
            cursor.execute(count_query)
            count_total = dict(cursor.fetchone())["count"]
        logger.info(f"Total Notice of Intents data to update: {count_total}")

        failed_inserts = 0
        successful_updates_count = 0
        last_application_id = 0

        with open(
            "noi/sql/notice_of_intent_submission/statuses/in_progress/notice_of_intent_status_in_progress.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            application_sql = sql_file.read()
            while True:
                cursor.execute(
                    f"{application_sql} WHERE oats_in_prog.alr_application_id > {last_application_id} ORDER BY oats_in_prog.alr_application_id;"
                )

                rows = cursor.fetchmany(batch_size)

                if not rows:
                    break
                try:
                    records_to_be_updated_count = len(rows)

                    _update_records(conn, batch_size, cursor, rows)

                    successful_updates_count = (
                        successful_updates_count + records_to_be_updated_count
                    )
                    last_application_id = dict(rows[-1])["alr_application_id"]

                    logger.debug(
                        f"retrieved/updated items count: {records_to_be_updated_count}; total successfully updated notice of intents so far {successful_updates_count}; last updated alr_application_id: {last_application_id}"
                    )
                except Exception as err:
                    # this is NOT going to be caused by actual data update failure. This code is only executed when the code error appears or connection to DB is lost
                    logger.exception()
                    conn.rollback()
                    failed_inserts = count_total - successful_updates_count
                    last_application_id = last_application_id + 1

    logger.info(
        f"Finished {etl_name}: total amount of successful updates {successful_updates_count}, total failed updates {failed_inserts}"
    )


def _update_records(conn, batch_size, cursor, rows):
    parsed_data_list = _prepare_oats_data(rows)

    if len(parsed_data_list) > 0:
        execute_batch(
            cursor,
            _update_query,
            parsed_data_list,
            page_size=batch_size,
        )

    conn.commit()


_update_query = """
                    UPDATE alcs.notice_of_intent_submission_to_submission_status 
                            SET effective_date  = %(date)s
                    WHERE submission_uuid = %(uuid)s and status_type_code = 'PROG'
"""


def _prepare_oats_data(row_data_list):
    data_list = []
    for row in row_data_list:
        data = _map_fields(dict(row))
        data_list.append(data)
    return data_list


def _map_fields(data):
    status_effective_date = None

    if data:
        if data["completion_date"]:
            status_effective_date = data["completion_date"]
        elif data["created_date"]:
            status_effective_date = data["created_date"]
        elif data["submitted_to_alc_date"]:
            status_effective_date = data["submitted_to_alc_date"]
        else:
            status_effective_date = data["when_created"]

    if status_effective_date:
        date = add_timezone_and_keep_date_part(status_effective_date)
        data["date"] = set_time(date)

    return data
