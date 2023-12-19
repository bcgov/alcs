from common import (
    OATS_ETL_USER,
    setup_and_get_logger,
    add_timezone_and_keep_date_part,
)
from db import inject_conn_pool
from psycopg2.extras import RealDictCursor, execute_batch

etl_name = "update_notice_of_intent_modifications"
logger = setup_and_get_logger(etl_name)


@inject_conn_pool
def update_notice_of_intent_modifications(conn=None, batch_size=1000):
    """
    This function is responsible for updating existing notice_of_intent_modification in ALCS.

    Args:
    conn (psycopg2.extensions.connection): PostgreSQL database connection. Provided by the decorator.
    batch_size (int): The number of items to process at once. Defaults to BATCH_UPLOAD_SIZE.
    """

    logger.info(f"Start {etl_name}")
    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        with open(
            "noi/sql/notice_of_intent_decisions/modifications/notice_of_intent_modification_insert_count.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            count_query = sql_file.read()
            cursor.execute(count_query)
            count_total = dict(cursor.fetchone())["count"]
        logger.info(
            f"Total Notice of Intent Modifications data to insert: {count_total}"
        )

        failed_inserts = 0
        successful_inserts_count = 0
        last_modification_id = 0

        with open(
            "noi/sql/notice_of_intent_decisions/modifications/notice_of_intent_modification_insert.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            query = sql_file.read()
            while True:
                cursor.execute(
                    f"{query} WHERE decisions.alr_appl_decision_id > {last_modification_id} ORDER BY decisions.alr_appl_decision_id;"
                )

                rows = cursor.fetchmany(batch_size)

                if not rows:
                    break
                try:
                    modifications_to_be_inserted_count = len(rows)

                    _insert_notice_of_intent_modifications(
                        conn, batch_size, cursor, rows
                    )

                    successful_inserts_count = (
                        successful_inserts_count + modifications_to_be_inserted_count
                    )
                    last_modification_id = dict(rows[-1])["alr_appl_decision_id"]

                    logger.debug(
                        f"retrieved/inserted items count: {modifications_to_be_inserted_count}; total successfully inserted modifications so far {successful_inserts_count}; last inserted alr_appl_decision_id: {last_modification_id}"
                    )
                except Exception as err:
                    logger.exception(err)
                    conn.rollback()
                    failed_inserts = count_total - successful_inserts_count
                    last_modification_id = last_modification_id + 1

    logger.info(
        f"Finished {etl_name}: total amount of successful inserts {successful_inserts_count}, total failed inserts {failed_inserts}"
    )


def _insert_notice_of_intent_modifications(conn, batch_size, cursor, rows):
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
                    submitted_date,
                    review_outcome_code,
                    notice_of_intent_uuid,
                    description,
                    oats_reconsideration_request_id
                )
                VALUES (
                    %(audit_created_by)s,
                    %(submitted_date)s,
                    %(review_outcome_code)s,
                    %(notice_of_intent_uuid)s,
                    %(description)s,
                    %(oats_reconsideration_request_id)s
                )
                ON CONFLICT DO NOTHING;
    """
    return query


def _prepare_oats_alr_applications_data(row_data_list):
    data_list = []
    for row in row_data_list:
        mapped_row = {
            "audit_created_by": OATS_ETL_USER,
            "submitted_date": add_timezone_and_keep_date_part(row.get("when_created")),
            "review_outcome_code": _map_outcome_code(row),
            "notice_of_intent_uuid": row.get("noi_uuid"),
            "description": row.get("description"),
            "oats_reconsideration_request_id": row.get(
                "oats_reconsideration_request_id"
            ),
        }
        data_list.append(mapped_row)

    return data_list


def _map_outcome_code(row):
    if row.get("outright_refusal_ind", None) == "N":
        return "APPR"
    elif row.get("outright_refusal_ind", None) == "Y":
        return "ONTP"
    return None


@inject_conn_pool
def clean_notice_of_intent_modifications(conn=None):
    logger.info("Start notice_of_intent_modification cleaning")
    with conn.cursor() as cursor:
        cursor.execute(
            f"DELETE FROM alcs.notice_of_intent_modification WHERE audit_created_by = '{OATS_ETL_USER}' AND audit_updated_by IS NULL"
        )
        logger.info(f"Deleted items count = {cursor.rowcount}")

    conn.commit()
