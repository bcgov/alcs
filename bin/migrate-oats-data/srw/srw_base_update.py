from common import (
    BATCH_UPLOAD_SIZE,
    setup_and_get_logger,
    add_timezone_and_keep_date_part,
)
from db import inject_conn_pool
from psycopg2.extras import RealDictCursor, execute_batch

etl_name = "update_srw_base_fields"
logger = setup_and_get_logger(etl_name)


@inject_conn_pool
def update_srw_base_fields(conn=None, batch_size=BATCH_UPLOAD_SIZE):
    """
    This function is responsible for populating date_submitted_to_alc in alcs.notification in ALCS.

    Args:
    conn (psycopg2.extensions.connection): PostgreSQL database connection. Provided by the decorator.
    batch_size (int): The number of items to process at once. Defaults to BATCH_UPLOAD_SIZE.
    """

    logger.info("Start update srw base fields")
    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        with open(
            "srw/sql/srw_base_update_count.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            count_query = sql_file.read()
            cursor.execute(count_query)
            count_total = dict(cursor.fetchone())["count"]
        logger.info(f"Total SRW data to update: {count_total}")

        failed_inserts = 0
        successful_updates_count = 0
        last_application_id = 0

        with open(
            "srw/sql/srw_base_update.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            query = sql_file.read()
            while True:
                cursor.execute(
                    f"""
                        {query} 
                        WHERE oaa.alr_application_id > {last_application_id}
                        GROUP BY oaa.alr_application_id 
                        ORDER BY oaa.alr_application_id;
                    """
                )

                rows = cursor.fetchmany(batch_size)

                if not rows:
                    break
                try:
                    updated_data = _update_base_fields(conn, batch_size, cursor, rows)

                    successful_updates_count = successful_updates_count + len(
                        updated_data
                    )
                    last_application_id = dict(updated_data[-1])["alr_application_id"]

                    logger.debug(
                        f"Retrieved/updated items count: {len(updated_data)}; total successfully updated SRW so far {successful_updates_count}; last updated application_id: {last_application_id}"
                    )
                except Exception as err:
                    # this is NOT going to be caused by actual data update failure. This code is only executed when the code error appears or connection to DB is lost
                    logger.exception(err)
                    conn.rollback()
                    failed_inserts = count_total - successful_updates_count
                    last_application_id = last_application_id + 1

    logger.info(
        f"Finished {etl_name}: total amount of successful updates {successful_updates_count}, total failed updates {failed_inserts}"
    )


def _update_base_fields(conn, batch_size, cursor, rows):
    parsed_data_list = _prepare_oats_srw_data(rows)

    execute_batch(
        cursor,
        _rx_items_query,
        parsed_data_list,
        page_size=batch_size,
    )

    conn.commit()
    return parsed_data_list


_rx_items_query = """
                    UPDATE alcs.notification 
                    SET date_submitted_to_alc = %(date_submitted_to_alc)s
                    WHERE alcs.notification.file_number = %(alr_application_id)s::text
"""


def _prepare_oats_srw_data(row_data_list):
    mapped_data_list = []
    for row in row_data_list:
        mapped_data_list.append(
            {
                "alr_application_id": row["alr_application_id"],
                "date_submitted_to_alc": add_timezone_and_keep_date_part(
                    row["date_submitted_to_alc"]
                ),
            }
        )

    return mapped_data_list
