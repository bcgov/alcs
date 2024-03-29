from common import (
    OATS_ETL_USER,
    setup_and_get_logger,
    add_timezone_and_keep_date_part,
    AlcsDecisionOutcomeCodeEnum,
    BATCH_UPLOAD_SIZE,
)
from db import inject_conn_pool
from psycopg2.extras import RealDictCursor, execute_batch

etl_name = "init_application_decision"
logger = setup_and_get_logger(etl_name)


@inject_conn_pool
def init_application_decisions(conn=None, batch_size=BATCH_UPLOAD_SIZE):
    """
    This function is responsible for initializing the application_decisions in ALCS.

    Args:
    conn (psycopg2.extensions.connection): PostgreSQL database connection. Provided by the decorator.
    batch_size (int): The number of items to process at once. Defaults to BATCH_UPLOAD_SIZE.
    """

    logger.info(f"Start {etl_name}")
    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        with open(
            "applications/decisions/sql/application_decision_insert_count.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            count_query = sql_file.read()
            cursor.execute(count_query)
            count_total = dict(cursor.fetchone())["count"]
        logger.info(f"Total Application Decisions data to insert: {count_total}")

        failed_inserts = 0
        successful_inserts_count = 0
        last_decision_id = 0

        with open(
            "applications/decisions/sql/application_decision_insert.sql",
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

                    _insert_application_decisions(conn, batch_size, cursor, rows)

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


def _insert_application_decisions(conn, batch_size, cursor, rows):
    """ """
    query = _get_insert_query()
    parsed_data_list = _prepare_oats_alr_applications_data(rows)

    if len(parsed_data_list) > 0:
        execute_batch(cursor, query, parsed_data_list, page_size=batch_size)

    conn.commit()


def _get_insert_query():
    query = f"""
                INSERT INTO alcs.application_decision (
                    audit_created_by,
                    created_at,
                    date,
                    decision_description,
                    chair_review_required,
                    is_draft,
                    outcome_code,
                    rescinded_comment,
                    rescinded_date,
                    resolution_number,
                    resolution_year,
                    was_released,
                    application_uuid,
                    is_subject_to_conditions,
                    oats_alr_appl_decision_id
                )
                VALUES (
                    %(audit_created_by)s,
                    %(created_at)s,
                    %(date)s,
                    %(decision_description)s,
                    true,
                    false,
                    %(outcome_code)s,
                    %(rescinded_comment)s,
                    %(rescinded_date)s,
                    %(resolution_number)s,
                    %(resolution_year)s,
                    true,
                    %(application_uuid)s,
                    %(is_subject_to_conditions)s,
                    %(oats_alr_appl_decision_id)s
                )
                ON CONFLICT ("resolution_number", "resolution_year")
                    WHERE "audit_deleted_date_at" is null and "resolution_number" is not NULL
                DO UPDATE SET 
                date = COALESCE(EXCLUDED.date, alcs.application_decision.date),
                outcome_code = COALESCE(EXCLUDED.outcome_code, alcs.application_decision.outcome_code),
                decision_description = COALESCE(EXCLUDED.decision_description, alcs.application_decision.decision_description),
                rescinded_comment =  COALESCE(EXCLUDED.rescinded_comment, alcs.application_decision.rescinded_comment),
                rescinded_date =  COALESCE(EXCLUDED.rescinded_date, alcs.application_decision.rescinded_date),
                is_subject_to_conditions = COALESCE(EXCLUDED.is_subject_to_conditions, alcs.application_decision.is_subject_to_conditions),
                was_released = True,
                is_draft = False,
                chair_review_required = COALESCE(EXCLUDED.chair_review_required, true),
                oats_alr_appl_decision_id = EXCLUDED.oats_alr_appl_decision_id;
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
            "application_uuid": row.get("app_uuid"),
            "is_subject_to_conditions": _map_is_subject_to_conditions(row),
            "oats_alr_appl_decision_id": row.get("alr_appl_decision_id"),
        }
        data_list.append(mapped_row)

    return data_list


def _map_outcome_code(row):
    if row.get("rescinded_date", None):
        return AlcsDecisionOutcomeCodeEnum.RESCINDED.value
    elif row.get("outright_refusal_ind", None) == "N":
        return AlcsDecisionOutcomeCodeEnum.APPROVED.value
    elif row.get("outright_refusal_ind", None) == "Y":
        return AlcsDecisionOutcomeCodeEnum.REFUSED.value
    return None


def _map_resolution_number_and_year(row):
    year_and_number = str(row["resolution_number"])
    # some data appears to only have a year, if this is the case the number will be set to 0
    if len(year_and_number) == 4:
        resolution_number = 0
    else:
        resolution_number = int(year_and_number[:-4])
    year = int(year_and_number[-4:])
    return resolution_number, year


def _map_is_subject_to_conditions(row):
    return row.get("is_subject_to_conditions", "False") == True


@inject_conn_pool
def clean_application_decisions(conn=None):
    logger.info("Start application_decisions cleaning")
    with conn.cursor() as cursor:
        cursor.execute(
            f"DELETE FROM alcs.application_decision WHERE audit_created_by = '{OATS_ETL_USER}' AND audit_updated_by is NULL"
        )
        logger.info(f"Deleted items count = {cursor.rowcount}")

    conn.commit()
