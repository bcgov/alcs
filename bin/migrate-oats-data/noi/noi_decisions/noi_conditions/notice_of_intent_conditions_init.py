from common import (
    OATS_ETL_USER,
    setup_and_get_logger,
    add_timezone_and_keep_date_part,
    OatsToAlcsConditionTypeMapping,
)
from db import inject_conn_pool
from psycopg2.extras import RealDictCursor, execute_batch

etl_name = "init_notice_of_intent_conditions"
logger = setup_and_get_logger(etl_name)


@inject_conn_pool
def init_notice_of_intent_conditions(conn=None, batch_size=1000):
    """
    This function is responsible for initializing the notice_of_intent_conditions in ALCS.

    Args:
    conn (psycopg2.extensions.connection): PostgreSQL database connection. Provided by the decorator.
    batch_size (int): The number of items to process at once. Defaults to BATCH_UPLOAD_SIZE.
    """

    logger.info(f"Start {etl_name}")
    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        with open(
            "noi/sql/notice_of_intent_decisions/conditions/notice_of_intent_decision_conditions_insert_count.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            count_query = sql_file.read()
            cursor.execute(count_query)
            count_total = dict(cursor.fetchone())["count"]
        logger.info(f"Total Notice of Intent Conditions data to insert: {count_total}")

        failed_inserts = 0
        successful_inserts_count = 0
        last_condition_id = 0

        with open(
            "noi/sql/notice_of_intent_decisions/conditions/notice_of_intent_decision_conditions_insert.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            query = sql_file.read()
            while True:
                cursor.execute(
                    f"""{query} 
                    WHERE oc.condition_id > {last_condition_id} ORDER BY oc.condition_id;"""
                )

                rows = cursor.fetchmany(batch_size)

                if not rows:
                    break
                try:
                    conditions_to_be_inserted_count = len(rows)

                    _insert_notice_of_intent_conditions(conn, batch_size, cursor, rows)

                    successful_inserts_count = (
                        successful_inserts_count + conditions_to_be_inserted_count
                    )
                    last_condition_id = dict(rows[-1])["condition_id"]

                    logger.debug(
                        f"retrieved/inserted items count: {conditions_to_be_inserted_count}; total successfully inserted conditions so far {successful_inserts_count}; last inserted reconsideration_request_id: {last_condition_id}"
                    )
                except Exception as err:
                    logger.exception(err)
                    conn.rollback()
                    failed_inserts = count_total - successful_inserts_count
                    last_condition_id = last_condition_id + 1

    logger.info(
        f"Finished {etl_name}: total amount of successful inserts {successful_inserts_count}, total failed inserts {failed_inserts}"
    )


def _insert_notice_of_intent_conditions(conn, batch_size, cursor, rows):
    query = _get_insert_query()
    parsed_data_list = _prepare_oats_conditions_data(rows)

    if len(parsed_data_list) > 0:
        execute_batch(cursor, query, parsed_data_list, page_size=batch_size)

    conn.commit()


def _get_insert_query():
    query = f"""
                INSERT INTO alcs.notice_of_intent_decision_condition (
                    administrative_fee,
                    approval_dependant,
                    audit_created_by,
                    completion_date,
                    decision_uuid,
                    "description",
                    type_code,
                    oats_condition_id
                )
                VALUES (
                    %(administrative_fee)s,
                    %(approval_dependant)s,
                    %(audit_created_by)s,
                    %(completion_date)s,
                    %(decision_uuid)s,
                    %(description)s,
                    %(type_code)s,
                    %(oats_condition_id)s
                )
                ON CONFLICT DO NOTHING;
    """
    return query


def _prepare_oats_conditions_data(row_data_list):
    data_list = []
    for row in row_data_list:
        mapped_row = {
            "administrative_fee": row.get("admin_fee"),
            "approval_dependant": row.get("approval_dependant_ind"),
            "audit_created_by": OATS_ETL_USER,
            "completion_date": add_timezone_and_keep_date_part(
                row.get("completion_date")
            ),
            "decision_uuid": row.get("decision_uuid"),
            "description": row.get("description"),
            "type_code": _map_condition_type_code(row),
            "oats_condition_id": row.get("oats_condition_id"),
        }
        data_list.append(mapped_row)

    return data_list


def _map_condition_type_code(row):
    type_code = row.get("type_code")
    if type_code is not None:
        return OatsToAlcsConditionTypeMapping[type_code].value


@inject_conn_pool
def clean_notice_of_intent_conditions(conn=None):
    logger.info("Start notice_of_intent_decision_condition cleaning")
    with conn.cursor() as cursor:
        cursor.execute(
            f"DELETE FROM alcs.notice_of_intent_decision_condition WHERE audit_created_by = '{OATS_ETL_USER}' AND audit_updated_by is NULL "
        )
        logger.info(f"Deleted items count = {cursor.rowcount}")

    conn.commit()
