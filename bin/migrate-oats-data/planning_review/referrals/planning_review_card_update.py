from common import (
    BATCH_UPLOAD_SIZE,
    setup_and_get_logger,
    add_timezone_and_keep_date_part,
    OatsToAlcsPlanningReviewType,
)
from db import inject_conn_pool
from psycopg2.extras import RealDictCursor, execute_batch

etl_name = "update_planning_review_cards"
logger = setup_and_get_logger(etl_name)


@inject_conn_pool
def update_planning_review_cards(conn=None, batch_size=BATCH_UPLOAD_SIZE):
    """
    This function is responsible for updating planning review cards in alcs.cards in ALCS.

    Args:
    conn (psycopg2.extensions.connection): PostgreSQL database connection. Provided by the decorator.
    batch_size (int): The number of items to process at once. Defaults to BATCH_UPLOAD_SIZE.
    """

    logger.info("Start update planning review base fields")
    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        with open(
            "planning_review/sql/referrals/update_planning_review_cards_count.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            count_query = sql_file.read()
            cursor.execute(count_query)
            count_total = dict(cursor.fetchone())["count"]
        logger.info(f"Total Planning Review data to update: {count_total}")

        failed_inserts = 0
        successful_updates_count = 0
        last_planning_review_id = "00000000-0000-0000-0000-000000000000"

        with open(
            "planning_review/sql/referrals/update_planning_review_cards.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            query = sql_file.read()
            while True:
                cursor.execute(
                    f"""
                        {query} WHERE ac."uuid" > '{last_planning_review_id}' ORDER BY ac."uuid";
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
                    last_planning_review_id = dict(updated_data[-1])["uuid"]

                    logger.debug(
                        f"Retrieved/updated items count: {len(updated_data)}; total successfully updated planning_review cards so far {successful_updates_count}; last updated planning_review card uuid: {last_planning_review_id}"
                    )
                except Exception as err:
                    # this is NOT going to be caused by actual data update failure. This code is only executed when the code error appears or connection to DB is lost
                    logger.exception(err)
                    conn.rollback()
                    failed_inserts = count_total - successful_updates_count
                    last_planning_review_id = rows[1]["uuid"]

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


# audit_updated_by is removed as the uuid is no longer needed to link referrals and cards
_rx_items_query = """
                    UPDATE alcs.card 
                    SET board_uuid = %(board_uuid)s,
                    audit_updated_by = %(audit_updated_by)s,
                    audit_deleted_date_at = %(deleted_date)s
                    WHERE alcs.card.uuid = %(uuid)s
"""


def _prepare_oats_planning_review_data(row_data_list):
    mapped_data_list = []
    for row in row_data_list:
        mapped_data_list.append(
            {
                "uuid": row["uuid"],
                "board_uuid": "e7b18852-4f8f-419e-83e3-60e706b4a494",
                "audit_updated_by": None,
                "deleted_date": row["audit_created_at"],
            }
        )

    return mapped_data_list
