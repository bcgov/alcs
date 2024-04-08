from common import (
    BATCH_UPLOAD_SIZE,
    setup_and_get_logger,
    add_timezone_and_keep_date_part,
    OatsToAlcsPlanningReviewType,
    DEFAULT_ETL_USER_UUID,
)
from db import inject_conn_pool
from psycopg2.extras import RealDictCursor, execute_batch

etl_name = "update_planning_review_base_fields"
logger = setup_and_get_logger(etl_name)


@inject_conn_pool
def update_planning_review_base_fields(conn=None, batch_size=BATCH_UPLOAD_SIZE):
    """
    This function is responsible for populating date_submitted_to_alc in alcs.planning_review in ALCS.

    Args:
    conn (psycopg2.extensions.connection): PostgreSQL database connection. Provided by the decorator.
    batch_size (int): The number of items to process at once. Defaults to BATCH_UPLOAD_SIZE.
    """

    logger.info("Start update planning review base fields")
    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        with open(
            "planning_review/sql/planning_review_base_update_count.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            count_query = sql_file.read()
            cursor.execute(count_query)
            count_total = dict(cursor.fetchone())["count"]
        logger.info(f"Total Planning Review data to update: {count_total}")

        failed_inserts = 0
        successful_updates_count = 0
        last_planning_review_id = 0

        with open(
            "planning_review/sql/planning_review_base_update.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            query = sql_file.read()
            while True:
                cursor.execute(
                    f"""
                        {query} 
                        WHERE ops.planning_review_id > {last_planning_review_id} ORDER BY ops.planning_review_id;
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
                    last_planning_review_id = dict(updated_data[-1])[
                        "planning_review_id"
                    ]

                    logger.debug(
                        f"Retrieved/updated items count: {len(updated_data)}; total successfully updated planning_review so far {successful_updates_count}; last updated planning_review_id: {last_planning_review_id}"
                    )
                except Exception as err:
                    # this is NOT going to be caused by actual data update failure. This code is only executed when the code error appears or connection to DB is lost
                    logger.exception(err)
                    conn.rollback()
                    failed_inserts = count_total - successful_updates_count
                    last_planning_review_id = last_planning_review_id + 1

    logger.info(
        f"Finished {etl_name}: total amount of successful updates {successful_updates_count}, total failed updates {failed_inserts}"
    )


def _update_base_fields(conn, batch_size, cursor, rows):
    parsed_data_list = _prepare_oats_planning_review_data(rows)

    execute_batch(
        cursor,
        _rx_items_query,
        parsed_data_list,
        page_size=batch_size,
    )

    conn.commit()
    return parsed_data_list


_rx_items_query = """
                    UPDATE alcs.planning_review 
                    SET open = %(open_indicator)s,
                    type_code = %(alcs_planning_review_code)s,
                    legacy_id = %(legacy_number)s,
                    closed_by_uuid = %(closed_by_uuid)s,
                    closed_date = %(closed_date)s
                    WHERE alcs.planning_review.file_number = %(planning_review_id)s::text
"""


def _prepare_oats_planning_review_data(row_data_list):
    mapped_data_list = []
    for row in row_data_list:
        mapped_data_list.append(
            {
                "planning_review_id": row["planning_review_id"],
                "open_indicator": _map_is_open(row),
                "alcs_planning_review_code": _map_planning_code(row),
                "legacy_number": row["legacy_planning_review_nbr"],
                "closed_by_uuid": _map_closed_by(row),
                "closed_date": _map_closed_date(row),
            }
        )

    return mapped_data_list


def _map_is_open(data):
    oats_val = data.get("open_ind")
    if oats_val == "Y":
        return True
    elif oats_val == "N":
        return False
    else:
        return True


def _map_closed_by(data):
    if data.get("open_ind") == "N":
        return DEFAULT_ETL_USER_UUID
    else:
        return None


def _map_closed_date(data):
    if data.get("open_ind") == "N":
        date_str = "0001-01-01 00:00:00.000 -0800"
        return date_str
    else:
        return None


def _map_planning_code(data):
    oats_code = data.get("planning_review_code")
    try:
        return OatsToAlcsPlanningReviewType[oats_code].value
    except KeyError:
        file_number = data.get("planning_review_id")
        logger.info(
            f"Key Error for{file_number}, no match to {oats_code} in ALCS, Override to MISC"
        )
        return "MISC"
