from common import (
    OATS_ETL_USER,
    setup_and_get_logger,
    BATCH_UPLOAD_SIZE
)
from db import inject_conn_pool
from psycopg2.extras import RealDictCursor, execute_batch

etl_name = "insert_application_component_lots"
logger = setup_and_get_logger(etl_name)


@inject_conn_pool
def init_application_component_lots(conn=None, batch_size=BATCH_UPLOAD_SIZE):
    """
    This function is responsible for initializing the application_decision_component_lot in ALCS.

    Args:
    conn (psycopg2.extensions.connection): PostgreSQL database connection. Provided by the decorator.
    batch_size (int): The number of items to process at once. Defaults to BATCH_UPLOAD_SIZE.
    """

    logger.info(f"Start {etl_name}")
    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        with open(
            "applications/decisions/sql/components/application_decision_component_lot_insert_count.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            count_query = sql_file.read()
            cursor.execute(count_query)
            count_total = dict(cursor.fetchone())["count"]
        logger.info(f"Total Application Component Lots data to insert: {count_total}")

        failed_inserts = 0
        successful_inserts_count = 0
        last_parcel_intent_id = 0

        with open(
            "applications/decisions/sql/components/application_decision_component_lot_insert.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            query = sql_file.read()
            while True:
                cursor.execute(
                    f"""{query} 
                    WHERE ospi.subdiv_parcel_intent_id > {last_parcel_intent_id} ORDER BY ospi.subdiv_parcel_intent_id;"""
                )

                rows = cursor.fetchmany(batch_size)

                if not rows:
                    break
                try:
                    lots_to_be_inserted_count = len(rows)

                    _insert_application_component_lots(conn, batch_size, cursor, rows)

                    successful_inserts_count = (
                        successful_inserts_count + lots_to_be_inserted_count
                    )
                    last_parcel_intent_id = dict(rows[-1])["subdiv_parcel_intent_id"]

                    logger.debug(
                        f"retrieved/inserted items count: {lots_to_be_inserted_count}; total successfully inserted component_lots so far {successful_inserts_count}; last inserted parcel_intent_id: {last_parcel_intent_id}"
                    )
                except Exception as err:
                    logger.exception(err)
                    conn.rollback()
                    failed_inserts = count_total - successful_inserts_count
                    last_parcel_intent_id = last_parcel_intent_id + 1

    logger.info(
        f"Finished {etl_name}: total amount of successful inserts {successful_inserts_count}, total failed inserts {failed_inserts}"
    )


def _insert_application_component_lots(conn, batch_size, cursor, rows):
    query = _get_insert_query()
    parsed_data_list = _prepare_oats_component_lots_data(rows)

    if len(parsed_data_list) > 0:
        execute_batch(cursor, query, parsed_data_list, page_size=batch_size)

    conn.commit()


def _get_insert_query():
    query = f"""
                INSERT INTO alcs.application_decision_component_lot (
                    size,
                    type,
                    audit_created_by,
                    component_uuid,
                    index
                )
                VALUES (
                    %(parcel_area)s,
                    %(type)s,
                    %(audit_created_by)s,
                    %(decision_component_uuid)s,
                    %(index)s
                )
                ON CONFLICT DO NOTHING;
    """
    return query


def _prepare_oats_component_lots_data(row_data_list):
    data_list = []
    component_id_counts ={}
    for row in row_data_list:
        mapped_row = {
            "parcel_area": row.get("parcel_area"),
            "decision_component_uuid": row.get("uuid"),
            "audit_created_by": OATS_ETL_USER,
            "index": _create_parcel_index(row, component_id_counts),
            "type": "Lot",

        }
        data_list.append(mapped_row)

    return data_list


def _create_parcel_index(row, component_id_counts):
    component_id = row.get("alr_appl_component_id")
    if component_id not in component_id_counts:
        component_id_counts[component_id] = 0
    component_id_counts[component_id] += 1
    return component_id_counts[component_id]

@inject_conn_pool
def clean_application_component_lots(conn=None):
    logger.info("Start application_decision_component_lot cleaning")
    with conn.cursor() as cursor:
        cursor.execute(
            f"DELETE FROM alcs.application_decision_component_lot WHERE audit_created_by = '{OATS_ETL_USER}' AND audit_updated_by is NULL "
        )
        logger.info(f"Deleted items count = {cursor.rowcount}")

    conn.commit()
