from common import (
    BATCH_UPLOAD_SIZE,
    setup_and_get_logger,
    add_timezone_and_keep_date_part,
    set_time,
)
from db import inject_conn_pool
from psycopg2.extras import RealDictCursor, execute_batch

etl_name = "update_application_date_rx_all_items"
logger = setup_and_get_logger(etl_name)


@inject_conn_pool
def update_application_date_rx_all_items(conn=None, batch_size=BATCH_UPLOAD_SIZE):
    """
    This function is responsible for populating date_received_all_items in application in ALCS.

    Args:
    conn (psycopg2.extensions.connection): PostgreSQL database connection. Provided by the decorator.
    batch_size (int): The number of items to process at once. Defaults to BATCH_UPLOAD_SIZE.
    """

    logger.info("Start update_application_date_rx_all_items")
    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        with open(
            "applications/sql/application-prep/app_rx_all_items_count.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            count_query = sql_file.read()
            cursor.execute(count_query)
            count_total = dict(cursor.fetchone())["count"]
        logger.info(f"Total Application data to update: {count_total}")

        failed_inserts = 0
        successful_updates_count = 0
        last_application_id = 0

        with open(
            "applications/sql/application-prep/app_rx_all_items.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            application_sql = sql_file.read()
            while True:
                cursor.execute(
                    f"{application_sql} AND oa.alr_application_id > {last_application_id} ORDER BY oa.alr_application_id;"
                )

                rows = cursor.fetchmany(batch_size)

                if not rows:
                    break
                try:
                    records_to_be_updated_count = _update_fee_fields_records(
                        conn, batch_size, cursor, rows
                    )

                    successful_updates_count = (
                        successful_updates_count + records_to_be_updated_count
                    )
                    last_application_id = dict(rows[-1])["alr_application_id"]

                    logger.debug(
                        f"Retrieved/updated items count: {records_to_be_updated_count}; total successfully updated applications so far {successful_updates_count}; last updated application_id: {last_application_id}"
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


def _update_fee_fields_records(conn, batch_size, cursor, rows):
    parsed_data_list = _prepare_oats_alr_applications_data(rows)
    actual_inserts = len(parsed_data_list)
    execute_batch(
        cursor,
        _rx_items_query,
        parsed_data_list,
        page_size=batch_size,
    )

    conn.commit()
    return actual_inserts


_rx_items_query = """
                    UPDATE alcs.application 
                    SET date_received_all_items = %(date_to_insert)s
                    WHERE alcs.application.file_number = %(alr_application_id)s::text
"""


def _prepare_oats_alr_applications_data(row_data_list):
    mapped_data_list = []
    for row in row_data_list:
        data = dict(row)
        data = _map_rx_date(data)
        mapped_data_list.append(data)
    filtered_data = [
        item
        for item in mapped_data_list
        if item["accomplishment_code"] == "AKC"
        or not any(
            entry["accomplishment_code"] == "AKC"
            for entry in mapped_data_list
            if entry["alr_application_id"] == item["alr_application_id"]
        )
    ]
    return filtered_data


def _map_rx_date(data):
    completion_date = data.get("completion_date", "")
    accomplishment_code = data.get("accomplishment_code", "")

    if accomplishment_code == "AKC" and completion_date:
        date = add_timezone_and_keep_date_part(completion_date)
        data["date_to_insert"] = set_time(date)
    elif data.get("date_to_insert") is None:
        if accomplishment_code == "SAL" and completion_date:
            date = add_timezone_and_keep_date_part(completion_date)
            data["date_to_insert"] = set_time(date)
        else:
            data["date_to_insert"] = None

    return data
