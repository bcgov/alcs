from common import (
    BATCH_UPLOAD_SIZE,
    OATS_ETL_USER,
    setup_and_get_logger,
    add_timezone_and_keep_date_part,
    OatsToAlcsPlanningReviewType,
)
from db import inject_conn_pool
from psycopg2.extras import RealDictCursor, execute_batch

etl_name = "init_planning_review_cards"
logger = setup_and_get_logger(etl_name)


@inject_conn_pool
def init_planning_review_cards(conn=None, batch_size=BATCH_UPLOAD_SIZE):
    """
    This function is responsible for populating planning review cards in ALCS.

    Args:
    conn (psycopg2.extensions.connection): PostgreSQL database connection. Provided by the decorator.
    batch_size (int): The number of items to process at once. Defaults to BATCH_UPLOAD_SIZE.
    """

    logger.info("Start insert planning review card fields")
    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        with open(
            "planning_review/sql/referrals/init_planning_review_cards_count.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            count_query = sql_file.read()
            cursor.execute(count_query)
            count_total = dict(cursor.fetchone())["count"]
        logger.info(f"Total Planning Review data to insert: {count_total}")

        failed_inserts = 0
        successful_updates_count = 0
        last_planning_review_id = 0

        with open(
            "planning_review/sql/referrals/init_planning_review_cards.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            query = sql_file.read()
            while True:
                cursor.execute(
                    f"""
                        {query} 
                        WHERE opr.planning_review_id > {last_planning_review_id} ORDER BY opr.planning_review_id;
                    """
                )

                rows = cursor.fetchmany(batch_size)

                if not rows:
                    break
                try:
                    updated_data = _insert_base_fields(conn, batch_size, cursor, rows)

                    successful_updates_count = successful_updates_count + len(
                        updated_data
                    )
                    last_planning_review_id = dict(updated_data[-1])[
                        "planning_review_id"
                    ]

                    logger.debug(
                        f"Retrieved/updated items count: {len(updated_data)}; total successfully inserted cards so far {successful_updates_count}; last updated planning_review_id: {last_planning_review_id}"
                    )
                except Exception as err:
                    # this is NOT going to be caused by actual data update failure. This code is only executed when the code error appears or connection to DB is lost
                    logger.exception(err)
                    conn.rollback()
                    failed_inserts = count_total - successful_updates_count
                    last_planning_review_id = last_planning_review_id + 1

    logger.info(
        f"Finished {etl_name}: total amount of successful inserts {successful_updates_count}, total failed inserts {failed_inserts}"
    )


def _insert_base_fields(conn, batch_size, cursor, rows):
    parsed_data_list = _prepare_oats_planning_review_card_data(rows)

    execute_batch(
        cursor,
        query,
        parsed_data_list,
        page_size=batch_size,
    )

    conn.commit()
    return parsed_data_list


# use audit_updated_by as temp placeholder for pr uuid
query = f"""
            INSERT INTO alcs.card (
                audit_updated_by,
                type_code,
                audit_created_by,
                archived,
                status_code
            )
            VALUES (
                %(uuid)s,
                %(type_code)s,
                '{OATS_ETL_USER}',
                %(archived)s,
                %(status_code)s
            )
"""


def _prepare_oats_planning_review_card_data(row_data_list):
    mapped_data_list = []
    for row in row_data_list:
        mapped_data_list.append(
            {
                "planning_review_id": row["planning_review_id"],
                "uuid": row["uuid"],
                "type_code": "PLAN",
                "status_code": "PREL",
                "archived": True,
            }
        )

    return mapped_data_list


@inject_conn_pool
def clean_planning_review_cards(conn=None):
    logger.info("Start card cleaning")
    with conn.cursor() as cursor:
        cursor.execute(
            f"DELETE FROM alcs.card nos WHERE nos.audit_created_by = '{OATS_ETL_USER}' "
        )
        logger.info(f"Deleted items count = {cursor.rowcount}")

    conn.commit()


# and nos.audit_updated_by is NULL"
