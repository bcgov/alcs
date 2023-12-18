from common import (
    OATS_ETL_USER,
    setup_and_get_logger,
    add_timezone_and_keep_date_part,
)
from db import inject_conn_pool
from psycopg2.extras import RealDictCursor, execute_batch

etl_name = "init_notice_of_intent_decision"
logger = setup_and_get_logger(etl_name)


@inject_conn_pool
def init_notice_of_intent_decisions(conn=None, batch_size=1000):
    """
    This function is responsible for initializing the notice_of_intent_decisions in ALCS.

    Args:
    conn (psycopg2.extensions.connection): PostgreSQL database connection. Provided by the decorator.
    batch_size (int): The number of items to process at once. Defaults to BATCH_UPLOAD_SIZE.
    """

    logger.info(f"Start {etl_name}")
    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        with open(
            "noi/sql/notice_of_intent_decisions/notice_of_intent_decision_insert_count.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            count_query = sql_file.read()
            cursor.execute(count_query)
            count_total = dict(cursor.fetchone())["count"]
        logger.info(f"Total Notice of Intent Submission data to insert: {count_total}")

        failed_inserts = 0
        successful_inserts_count = 0
        last_decision_id = 0

        with open(
            "noi/sql/notice_of_intent_decisions/notice_of_intent_decision_insert.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            query = sql_file.read()
            while True:
                cursor.execute(
                    f"{query} WHERE decisions.alr_appl_decision_id > {last_decision_id} ORDER BY decisions.alr_appl_decision_id;"
                )

                rows = cursor.fetchmany(batch_size)

                if not rows:
                    break
                try:
                    decisions_to_be_inserted_count = len(rows)

                    _insert_notice_of_intent_decisions(conn, batch_size, cursor, rows)

                    successful_inserts_count = (
                        successful_inserts_count + decisions_to_be_inserted_count
                    )
                    last_decision_id = dict(rows[-1])["alr_appl_decision_id"]

                    logger.debug(
                        f"retrieved/inserted items count: {decisions_to_be_inserted_count}; total successfully inserted decisions so far {successful_inserts_count}; last inserted alr_appl_decision_id: {last_decision_id}"
                    )
                except Exception as err:
                    logger.exception(err)
                    conn.rollback()
                    failed_inserts = count_total - successful_inserts_count
                    last_decision_id = last_decision_id + 1

    logger.info(
        f"Finished {etl_name}: total amount of successful inserts {successful_inserts_count}, total failed inserts {failed_inserts}"
    )


def _insert_notice_of_intent_decisions(conn, batch_size, cursor, rows):
    """ """
    query = _get_insert_query()
    parsed_data_list = _prepare_oats_alr_applications_data(rows)

    if len(parsed_data_list) > 0:
        execute_batch(cursor, query, parsed_data_list, page_size=batch_size)

    conn.commit()


def _get_insert_query():
    query = f"""
                INSERT INTO alcs.notice_of_intent_decision (
                    audit_created_by,
                    created_at,
                    date,
                    decision_description,
                    decision_maker,
                    is_draft,
                    outcome_code,
                    rescinded_comment,
                    rescinded_date,
                    resolution_number,
                    resolution_year,
                    was_released,
                    notice_of_intent_uuid,
                    is_subject_to_conditions,
                    oats_alr_appl_decision_id
                )
                VALUES (
                    %(audit_created_by)s,
                    %(created_at)s,
                    %(date)s,
                    %(decision_description)s,
                    'CEO',
                    false,
                    %(outcome_code)s,
                    %(rescinded_comment)s,
                    %(rescinded_date)s,
                    %(resolution_number)s,
                    %(resolution_year)s,
                    true,
                    %(notice_of_intent_uuid)s,
                    %(is_subject_to_conditions)s,
                    %(oats_alr_appl_decision_id)s
                )
                ON CONFLICT ("resolution_number", "resolution_year")
                    WHERE "audit_deleted_date_at" is null and "resolution_number" is not NULL
                DO UPDATE SET 
                date = COALESCE(EXCLUDED.date, alcs.notice_of_intent_decision.date),
                decision_maker = COALESCE(EXCLUDED.decision_maker, alcs.notice_of_intent_decision.decision_maker),
                outcome_code = COALESCE(EXCLUDED.outcome_code, alcs.notice_of_intent_decision.outcome_code);
    """
    return query


def _prepare_oats_alr_applications_data(row_data_list):
    data_list = []
    for row in row_data_list:
        resolution_number, year = _map_resolution_number_and_year(row)
        mapped_row = {
            "audit_created_by": OATS_ETL_USER,
            "created_at": add_timezone_and_keep_date_part(row.get("when_created")),
            "date": add_timezone_and_keep_date_part(row.get("decision_date")),
            "decision_description": row.get("decision_desc"),
            "decision_maker": "CEO",
            "is_draft": False,
            "outcome_code": _map_outcome_code(row),
            "rescinded_comment": row.get("rescinded_comments"),
            "rescinded_date": add_timezone_and_keep_date_part(
                row.get("rescinded_date")
            ),
            "resolution_number": resolution_number,
            "resolution_year": year,
            "was_released": True,
            "notice_of_intent_uuid": row.get("noi_uuid"),
            "is_subject_to_conditions": _map_is_subject_to_conditions(row),
            "oats_alr_appl_decision_id": row.get("alr_appl_decision_id"),
        }
        data_list.append(mapped_row)

    return data_list


def _map_outcome_code(row):
    if row.get("rescinded_date", None) is not None:
        return "ONTP"
    elif row.get("outright_refusal_ind", None) == "N":
        return "APPR"
    elif row.get("outright_refusal_ind", None) == "Y":
        return "ONTP"
    return None


def _map_resolution_number_and_year(row):
    year_and_number = str(row["resolution_number"])
    resolution_number = int(year_and_number[:-4])
    year = int(year_and_number[-4:])
    return resolution_number, year


def _map_is_subject_to_conditions(row):
    return row.get("is_subject_to_conditions", "False") == True


@inject_conn_pool
def clean_notice_of_intents(conn=None):
    logger.info("Start notice_of_intent_decisions cleaning")
    with conn.cursor() as cursor:
        cursor.execute(
            f"DELETE FROM alcs.notice_of_intent_decision WHERE audit_created_by = '{OATS_ETL_USER}' AND audit_updated_by = null"
        )
        logger.info(f"Deleted items count = {cursor.rowcount}")

    conn.commit()
