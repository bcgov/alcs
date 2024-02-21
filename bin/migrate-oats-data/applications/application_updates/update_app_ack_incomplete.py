from common import (
    setup_and_get_logger,
    BATCH_UPLOAD_SIZE
)
from db import inject_conn_pool
from psycopg2.extras import RealDictCursor, execute_batch

etl_name = "update_application_incomplete_date"
logger = setup_and_get_logger(etl_name)


@inject_conn_pool
def update_application_incomplete_date(conn=None, batch_size=BATCH_UPLOAD_SIZE):
    """
    This function is responsible for updating existing the application acknowledged_incomplete_date in ALCS.

    Args:
    conn (psycopg2.extensions.connection): PostgreSQL database connection. Provided by the decorator.
    batch_size (int): The number of items to process at once. Defaults to BATCH_UPLOAD_SIZE.
    """

    logger.info(f"Start {etl_name}")
    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        with open(
            "applications/sql/application_update_incomplete_date_count.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            count_query = sql_file.read()
            cursor.execute(count_query)
            count_total = dict(cursor.fetchone())["count"]
        logger.info(f"Total Application data to be updated: {count_total}")

        failed_updates_count = 0
        successful_updates_count = 0
        last_file_number = 0

        with open(
            "applications/sql/application_update_incomplete_date.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            query = sql_file.read()
            while True:
                cursor.execute(
                    f"""{query}
                      AND as2.file_number::bigint > '{last_file_number}' ORDER BY as2.file_number::bigint;"""
                )

                rows = cursor.fetchmany(batch_size)

                if not rows:
                    break
                try:
                    conditions_to_be_updated_count = len(rows)

                    _update_application_incomplete_date(conn, batch_size, cursor, rows)

                    successful_updates_count = (
                        successful_updates_count + conditions_to_be_updated_count
                    )
                    last_file_number = dict(rows[-1])["file_number"]

                    logger.debug(
                        f"retrieved/updated items count: {conditions_to_be_updated_count}; total successfully updated applications so far {successful_updates_count}; last updated application: {last_file_number}"
                    )
                except Exception as err:
                    logger.exception(err)
                    conn.rollback()
                    failed_updates_count = count_total - successful_updates_count
                    last_file_number = last_file_number + 1

    logger.info(
        f"Finished {etl_name}: total amount of successful updates {successful_updates_count}, total failed updates {failed_updates_count}"
    )


def _update_application_incomplete_date(conn, batch_size, cursor, rows):
    data = _prepare_applications_data(rows)

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
                 UPDATE alcs.application
                    SET date_acknowledged_incomplete = %(date_to_insert)s
                    WHERE alcs.application.file_number = %(file_number)s;
    """
    return query


def _prepare_applications_data(row_data_list):
    data_list = []
    date_to_insert = None
    for row in row_data_list:
        mapped_row = {
            "date_to_insert": row.get("effective_date"),
            "file_number": row.get("file_number"),
        }
        data_list.append(mapped_row)

    return data_list
