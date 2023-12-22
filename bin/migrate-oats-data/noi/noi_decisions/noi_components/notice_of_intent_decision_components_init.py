from common import (
    OATS_ETL_USER,
    setup_and_get_logger,
    add_timezone_and_keep_date_part,
    ALRChangeCode,
    OatsToAlcsAgCap,
    OatsToAlcsAgCapSource,
)
from db import inject_conn_pool
from psycopg2.extras import RealDictCursor, execute_batch

etl_name = "init_notice_of_intent_decision_components"
logger = setup_and_get_logger(etl_name)


@inject_conn_pool
def init_notice_of_intent_decision_components(conn=None, batch_size=1000):
    """
    This function is responsible for initializing the notice_of_intent_decision_components in ALCS.

    Args:
    conn (psycopg2.extensions.connection): PostgreSQL database connection. Provided by the decorator.
    batch_size (int): The number of items to process at once. Defaults to BATCH_UPLOAD_SIZE.
    """

    logger.info(f"Start {etl_name}")
    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        with open(
            "noi/sql/notice_of_intent_decisions/components/notice_of_intent_decision_components_insert_count.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            count_query = sql_file.read()
            cursor.execute(count_query)
            count_total = dict(cursor.fetchone())["count"]
        logger.info(
            f"Total Notice of Intent Decision Components data to insert: {count_total}"
        )

        failed_inserts = 0
        successful_inserts_count = 0
        last_decision_component_id = 0

        tmp_counter = 0

        with open(
            "noi/sql/notice_of_intent_decisions/components/notice_of_intent_decision_components_insert.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            query = sql_file.read()

            while True:
                cursor.execute(
                    f"""{query} 
                    WHERE oaac.alr_appl_component_id > {last_decision_component_id} ORDER BY oaac.alr_appl_component_id;"""
                )

                rows = cursor.fetchmany(batch_size)

                if not rows:
                    break
                try:
                    decision_components_to_be_inserted_count = len(rows)

                    _insert_notice_of_intent_decision_components(
                        conn, batch_size, cursor, rows
                    )

                    successful_inserts_count = (
                        successful_inserts_count
                        + decision_components_to_be_inserted_count
                    )
                    last_decision_component_id = rows[-1]["component_id"]

                    logger.info(
                        f"retrieved/inserted items count: {decision_components_to_be_inserted_count}; total successfully inserted decision components so far {successful_inserts_count}; last inserted alr_appl_component_id: {last_decision_component_id}"
                    )
                except Exception as err:
                    logger.exception(err)
                    conn.rollback()
                    failed_inserts = count_total - successful_inserts_count
                    last_decision_component_id = last_decision_component_id + 1

    logger.info(
        f"Finished {etl_name}: total amount of successful inserts {successful_inserts_count}, total failed inserts {failed_inserts}"
    )


def _insert_notice_of_intent_decision_components(conn, batch_size, cursor, rows):
    query = _get_insert_query()
    parsed_data_list = _prepare_oats_alr_applications_data(rows)

    if len(parsed_data_list) > 0:
        execute_batch(cursor, query, parsed_data_list, page_size=batch_size)

    conn.commit()


def _get_insert_query():
    query = f"""
                INSERT INTO alcs.notice_of_intent_decision_component (
                    ag_cap,
                    ag_cap_consultant,
                    ag_cap_map,
                    ag_cap_source,
                    alr_area,
                    audit_created_by,
                    end_date,
                    end_date2,
                    expiry_date,
                    notice_of_intent_decision_component_type_code,
                    notice_of_intent_decision_uuid,
                    oats_alr_appl_component_id
                )
                VALUES (
                    %(ag_cap)s,
                    %(ag_cap_consultant)s,
                    %(ag_cap_map)s,
                    %(ag_cap_source)s,
                    %(alr_area)s,
                    %(audit_created_by)s,
                    %(end_date)s,
                    %(end_date2)s,
                    %(expiry_date)s,
                    %(notice_of_intent_decision_component_type_code)s,
                    %(notice_of_intent_decision_uuid)s,
                    %(alr_appl_component_id)s
                )
                ON CONFLICT DO NOTHING; -- there are no components on prod
    """
    return query


def _prepare_oats_alr_applications_data(row_data_list):
    data_list = []
    for row in row_data_list:
        if row.get("alr_change_code", None) in [
            ALRChangeCode.SCH.value,
            ALRChangeCode.FILL.value,
            ALRChangeCode.EXT.value,
        ]:
            mapped_row = {
                "ag_cap": str(OatsToAlcsAgCap[row["agri_capability_code"]].value)
                if row.get("agri_capability_code")
                else None,
                "ag_cap_consultant": row.get("agri_cap_consultant"),
                "ag_cap_map": row.get("agri_cap_map"),
                "ag_cap_source": str(
                    OatsToAlcsAgCapSource[row["capability_source_code"]].value
                )
                if row.get("capability_source_code")
                else None,
                "alr_area": row.get("component_area"),
                "audit_created_by": OATS_ETL_USER,
                "end_date": add_timezone_and_keep_date_part(
                    row.get("nonfarm_use_end_date")
                ),
                "end_date2": add_timezone_and_keep_date_part(
                    row.get("nonfarm_use_end_date")
                ),
                "expiry_date": add_timezone_and_keep_date_part(
                    row.get("decision_expiry_date")
                ),
                "notice_of_intent_decision_component_type_code": _map_component_type_code(
                    row
                ),
                "notice_of_intent_decision_uuid": row.get("decision_uuid"),
                "alr_appl_component_id": row.get("component_id"),
            }
            data_list.append(mapped_row)

    return data_list


def _map_component_type_code(row):
    alr_change_code = row.get("alr_change_code")
    if alr_change_code == ALRChangeCode.SCH.value:
        return "PFRS"

    if alr_change_code == ALRChangeCode.EXT.value:
        return "ROSO"

    if alr_change_code == ALRChangeCode.FILL.value:
        return "POFO"

    return None


@inject_conn_pool
def clean_notice_of_intent_decision_components(conn=None):
    logger.info("Start notice_of_intent_decision_component cleaning")
    with conn.cursor() as cursor:
        cursor.execute(
            f"DELETE FROM alcs.notice_of_intent_decision_component WHERE audit_created_by = '{OATS_ETL_USER}' AND audit_updated_by is NULL"
        )
        logger.info(f"Deleted items count = {cursor.rowcount}")

    conn.commit()
