from common import (
    BATCH_UPLOAD_SIZE,
    OATS_ETL_USER,
    setup_and_get_logger,
    add_timezone_and_keep_date_part,
    OatsToAlcsDecisionOutcomes,
    AlcsPlanningReviewOutcomes,
)
from db import inject_conn_pool
from psycopg2.extras import RealDictCursor, execute_batch
from datetime import datetime

etl_name = "init_planning_review_decision"
logger = setup_and_get_logger(etl_name)


@inject_conn_pool
def process_planning_review_decisions(conn=None, batch_size=BATCH_UPLOAD_SIZE):
    """
    This function is responsible for populating alcs.planning_review_decision in ALCS.

    Args:
    conn (psycopg2.extensions.connection): PostgreSQL database connection. Provided by the decorator.
    batch_size (int): The number of items to process at once. Defaults to BATCH_UPLOAD_SIZE.
    """

    logger.info("Start insert planning decision fields")
    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        with open(
            "planning_review/sql/decisions/planning_review_decisions_insert_count.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            count_query = sql_file.read()
            cursor.execute(count_query)
            count_total = dict(cursor.fetchone())["count"]
        logger.info(f"Total Planning decision data to insert: {count_total}")

        failed_inserts_count = 0
        successful_inserts_count = 0
        last_planning_decision_id = 0

        with open(
            "planning_review/sql/decisions/planning_review_decisions_insert.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            query = sql_file.read()
            while True:
                cursor.execute(
                    f"""
                        {query} 
                        WHERE opd.planning_decision_id > {last_planning_decision_id} ORDER BY opd.planning_decision_id;
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
                    last_planning_decision_id = dict(inserted_data[-1])[
                        "planning_decision_id"
                    ]

                    logger.debug(
                        f"Retrieved/updated items count: {len(inserted_data)}; total successfully inserted planning referral so far {successful_inserts_count}; last updated planning_decision_id: {last_planning_decision_id}"
                    )
                except Exception as err:

                    logger.exception(err)
                    conn.rollback()
                    failed_inserts_count = count_total - successful_inserts_count
                    last_planning_decision_id = last_planning_decision_id + 1

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
            INSERT INTO alcs.planning_review_decision (
                planning_review_uuid,
                decision_description,
                audit_created_by,
                was_released,
                outcome_code,
                resolution_number,
                resolution_year,
                date
            )
            VALUES (
                %(review_uuid)s,
                %(description)s,
                '{OATS_ETL_USER}',
                %(was_released)s,
                %(outcome_code)s,
                %(resolution_number)s,
                %(resolution_year)s,
                %(date)s
            )
"""


def _prepare_oats_planning_review_data(row_data_list):
    mapped_data_list = []
    for row in row_data_list:
        mapped_data_list.append(
            {
                "planning_decision_id": row["planning_decision_id"],
                "review_uuid": row["uuid"],
                "description": row["description"],
                "date": _map_date(row),
                "was_released": True,
                "outcome_code": _map_outcome_code(row),
                "resolution_number": row["resolution_number"],
                "resolution_year": _map_resolution_year(row),
            }
        )

    return mapped_data_list


def _map_date(data):
    date = data.get("decision_date", "")
    d_date = add_timezone_and_keep_date_part(date)
    return d_date


def _map_outcome_code(data):
    oats_code = data.get("planning_acceptance_code", "")
    if any(oats_code == item.name for item in OatsToAlcsDecisionOutcomes):
        alcs_value = OatsToAlcsDecisionOutcomes[oats_code].value
        for outcome in AlcsPlanningReviewOutcomes:
            if outcome.value == alcs_value:
                return outcome.name
    file_number = data.get("planning_decision_id")
    logger.info(
        f"Key Error for planning_decision_id {file_number}, no match to {oats_code} in ALCS, Override to OTHR"
    )
    return "OTHR"


def _map_resolution_year(data):
    full_date = data.get("decision_date", "")
    if full_date is None:
        return None
    if isinstance(full_date, str):
        date_object = datetime.strptime(full_date, "%Y-%m-%d %H:%M:%S.%f")
    else:
        date_object = full_date
    year = date_object.year
    return year


@inject_conn_pool
def clean_planning_decisions(conn=None):
    logger.info("Start planning_decision cleaning")
    with conn.cursor() as cursor:
        cursor.execute(
            f"DELETE FROM alcs.planning_review_decision nos WHERE nos.audit_created_by = '{OATS_ETL_USER}' and nos.audit_updated_by is NULL"
        )
        logger.info(f"Deleted items count = {cursor.rowcount}")

    conn.commit()
