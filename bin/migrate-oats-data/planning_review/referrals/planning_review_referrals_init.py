from common import (
    BATCH_UPLOAD_SIZE,
    OATS_ETL_USER,
    setup_and_get_logger,
    add_timezone_and_keep_date_part,
    OatsToAlcsPlanningReviewType,
)
from db import inject_conn_pool
from psycopg2.extras import RealDictCursor, execute_batch

etl_name = "init_planning_review_referral"
logger = setup_and_get_logger(etl_name)


@inject_conn_pool
def process_planning_review_referral(conn=None, batch_size=BATCH_UPLOAD_SIZE):
    """
    This function is responsible for populating alcs.planning_referral in ALCS.

    Args:
    conn (psycopg2.extensions.connection): PostgreSQL database connection. Provided by the decorator.
    batch_size (int): The number of items to process at once. Defaults to BATCH_UPLOAD_SIZE.
    """

    logger.info("Start insert planning referral fields")
    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        with open(
            "planning_review/sql/referrals/insert_planning_review_referrals_count.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            count_query = sql_file.read()
            cursor.execute(count_query)
            count_total = dict(cursor.fetchone())["count"]
        logger.info(f"Total Planning Referral data to insert: {count_total}")

        failed_inserts_count = 0
        successful_inserts_count = 0
        last_planning_review_id = 0

        with open(
            "planning_review/sql/referrals/insert_planning_review_referrals.sql",
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
                    inserted_data = _insert_base_fields(conn, batch_size, cursor, rows)

                    successful_inserts_count = successful_inserts_count + len(
                        inserted_data
                    )
                    last_planning_review_id = dict(inserted_data[-1])[
                        "planning_review_id"
                    ]

                    logger.debug(
                        f"Retrieved/updated items count: {len(inserted_data)}; total successfully inserted planning referral so far {successful_inserts_count}; last updated planning_review_id: {last_planning_review_id}"
                    )
                except Exception as err:
                    # this is NOT going to be caused by actual data insert failure. This code is only executed when the code error appears or connection to DB is lost
                    logger.exception(err)
                    conn.rollback()
                    failed_inserts_count = count_total - successful_inserts_count
                    last_planning_review_id = last_planning_review_id + 1

    logger.info(
        f"Finished {etl_name}: total amount of successful inserts {successful_inserts_count}, total failed inserts {failed_inserts_count}"
    )


def _insert_base_fields(conn, batch_size, cursor, rows):
    parsed_data_list = _prepare_oats_planning_review_data(rows)

    execute_batch(
        cursor,
        query,
        parsed_data_list,
        page_size=batch_size,
    )

    conn.commit()
    return parsed_data_list


query = f"""
            INSERT INTO alcs.planning_referral (
                planning_review_uuid,
                referral_description,
                audit_created_by,
                submission_date,
                card_uuid
            )
            VALUES (
                %(review_uuid)s,
                %(description)s,
                '{OATS_ETL_USER}',
                %(rx_date)s,
                %(card_uuid)s
            )
"""


def _prepare_oats_planning_review_data(row_data_list):
    mapped_data_list = []
    for row in row_data_list:
        mapped_data_list.append(
            {
                "planning_review_id": row["planning_review_id"],
                "file_number": row["file_number"],
                "review_uuid": row["uuid"],
                "description": row["description"],
                "rx_date": _map_rx_date(row),
                "card_uuid": row["card_uuid"],
            }
        )

    return mapped_data_list


def _map_rx_date(data):
    date = data.get("received_date", "")
    rx_date = add_timezone_and_keep_date_part(date)
    return rx_date


@inject_conn_pool
def clean_planning_referrals(conn=None):
    logger.info("Start planning_referral cleaning")
    with conn.cursor() as cursor:
        cursor.execute(
            f"DELETE FROM alcs.planning_referral nos WHERE nos.audit_created_by = '{OATS_ETL_USER}' and nos.audit_updated_by is NULL"
        )
        logger.info(f"Deleted items count = {cursor.rowcount}")

    conn.commit()
