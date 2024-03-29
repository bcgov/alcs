from common import (
    OATS_ETL_USER,
    setup_and_get_logger,
    add_timezone_and_keep_date_part,
    BATCH_UPLOAD_SIZE,
    AlcsAppReconsiderationOutcomeCodeEnum,
)
from db import inject_conn_pool
from psycopg2.extras import RealDictCursor, execute_batch

etl_name = "init_application_reconsiderations"
logger = setup_and_get_logger(etl_name)


@inject_conn_pool
def init_application_reconsiderations(conn=None, batch_size=BATCH_UPLOAD_SIZE):
    """
    This function is responsible for initializing the application_reconsideration in ALCS.

    Args:
    conn (psycopg2.extensions.connection): PostgreSQL database connection. Provided by the decorator.
    batch_size (int): The number of items to process at once. Defaults to BATCH_UPLOAD_SIZE.
    """

    logger.info(f"Start {etl_name}")
    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        with open(
            "applications/decisions/sql/reconsiderations/application_reconsideration_insert_count.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            count_query = sql_file.read()
            cursor.execute(count_query)
            count_total = dict(cursor.fetchone())["count"]
        logger.info(f"Total Application Reconsiderations data to insert: {count_total}")

        failed_inserts = 0
        successful_inserts_count = 0
        last_reconsideration_id = 0

        with open(
            "applications/decisions/sql/reconsiderations/application_reconsideration_insert.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            query = sql_file.read()
            while True:
                cursor.execute(
                    f"{query} and orr.reconsideration_request_id > {last_reconsideration_id} ORDER BY orr.reconsideration_request_id;"
                )

                rows = cursor.fetchmany(batch_size)

                if not rows:
                    break
                try:
                    reconsiderations_to_be_inserted_count = len(rows)

                    _insert_application_reconsiderations(conn, batch_size, cursor, rows)

                    successful_inserts_count = (
                        successful_inserts_count + reconsiderations_to_be_inserted_count
                    )
                    last_reconsideration_id = dict(rows[-1])[
                        "reconsideration_request_id"
                    ]

                    logger.debug(
                        f"retrieved/inserted items count: {reconsiderations_to_be_inserted_count}; total successfully inserted reconsiderations so far {successful_inserts_count}; last inserted reconsideration_request_id: {last_reconsideration_id}"
                    )
                except Exception as err:
                    logger.exception(err)
                    conn.rollback()
                    failed_inserts = count_total - successful_inserts_count
                    last_reconsideration_id = last_reconsideration_id + 1

    logger.info(
        f"Finished {etl_name}: total amount of successful inserts {successful_inserts_count}, total failed inserts {failed_inserts}"
    )


def _insert_application_reconsiderations(conn, batch_size, cursor, rows):
    """ """
    query = _get_insert_query()
    parsed_data_list = _prepare_oats_alr_applications_data(rows)

    if len(parsed_data_list) > 0:
        execute_batch(cursor, query, parsed_data_list, page_size=batch_size)

    conn.commit()


def _get_insert_query():
    query = f"""
                INSERT INTO alcs.application_reconsideration (
                    audit_created_by,
                    submitted_date,
                    application_uuid,
                    description,
                    oats_reconsideration_request_id,
                    is_incorrect_false_info,
                    is_new_evidence,
                    is_new_proposal,
                    type_code,
                    review_outcome_code
                )
                VALUES (
                    %(audit_created_by)s,
                    %(submitted_date)s,
                    %(application_uuid)s,
                    %(description)s,
                    %(oats_reconsideration_request_id)s,
                    %(is_incorrect_false_info)s,
                    %(is_new_evidence)s,
                    %(is_new_proposal)s,
                    %(type_code)s,
                    %(review_outcome_code)s
                )
                ON CONFLICT DO NOTHING;
    """
    return query


def _prepare_oats_alr_applications_data(row_data_list):
    data_list = []
    for row in row_data_list:
        mapped_row = {
            "audit_created_by": OATS_ETL_USER,
            "submitted_date": add_timezone_and_keep_date_part(row.get("received_date")),
            "application_uuid": row.get("app_uuid"),
            "description": row.get("description"),
            "oats_reconsideration_request_id": row.get("reconsideration_request_id"),
            "is_incorrect_false_info": row.get("error_information_ind"),
            "is_new_evidence": row.get("new_information_ind"),
            "is_new_proposal": row.get("new_proposal_ind"),
            "type_code": "33",
            "review_outcome_code": _map_review_outcome_code(row),
            "review_date": _map_review_date(row),
        }
        data_list.append(mapped_row)

    return data_list


def _map_review_outcome_code(row):
    if row.get("approved_date", None) is not None:
        return AlcsAppReconsiderationOutcomeCodeEnum.PROCEED_TO_RECONSIDER.value
    else:
        return AlcsAppReconsiderationOutcomeCodeEnum.PENDING.value


def _map_review_date(row):
    review_code = _map_review_outcome_code(row)
    approved_date = add_timezone_and_keep_date_part(row.get("approved_date"))
    return (
        approved_date
        if review_code
        == AlcsAppReconsiderationOutcomeCodeEnum.PROCEED_TO_RECONSIDER.value
        else None
    )


@inject_conn_pool
def clean_application_reconsiderations(conn=None):
    logger.info("Start application_reconsideration cleaning")
    with conn.cursor() as cursor:
        cursor.execute(
            f"""
                DELETE FROM alcs.application_reconsideration WHERE audit_created_by = '{OATS_ETL_USER}' AND audit_updated_by is NULL;
                UPDATE alcs.application_reconsideration 
                SET oats_reconsideration_request_id = NULL
                WHERE oats_reconsideration_request_id IS NOT NULL;
            """
        )
        logger.info(f"Deleted items count = {cursor.rowcount}")

    conn.commit()
