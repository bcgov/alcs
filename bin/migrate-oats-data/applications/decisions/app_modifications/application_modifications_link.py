from common import (
    OATS_ETL_USER,
    setup_and_get_logger,
)
from db import inject_conn_pool
from psycopg2.extras import RealDictCursor, execute_batch

etl_name = "link_application_modifications"
logger = setup_and_get_logger(etl_name)


@inject_conn_pool
def link_application_modifications(conn=None, batch_size=1000):
    """
    This function is responsible for linking application_modification to application_decisions in ALCS.

    Args:
    conn (psycopg2.extensions.connection): PostgreSQL database connection. Provided by the decorator.
    batch_size (int): The number of items to process at once. Defaults to BATCH_UPLOAD_SIZE.
    """

    logger.info(f"Start {etl_name}")
    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        with open(
            "applications/decisions/sql/modifications/application_modification_link_to_decisions_count.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            count_query = sql_file.read()
            cursor.execute(count_query)
            count_total = dict(cursor.fetchone())["count"]
        logger.info(f"Total Notice of Intent Modifications data to link: {count_total}")

        failed_updates = 0
        successful_updates_count = 0
        last_modification_id = 0

        with open(
            "applications/decisions/sql/modifications/application_modification_link_to_decisions.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            query = sql_file.read()
            while True:
                cursor.execute(
                    f"{query} and orr.reconsideration_request_id > {last_modification_id} ORDER BY orr.reconsideration_request_id;"
                )

                rows = cursor.fetchmany(batch_size)

                if not rows:
                    break
                try:
                    modifications_to_be_updated_count = len(rows)

                    _update_application_modifications(conn, batch_size, cursor, rows)

                    successful_updates_count = (
                        successful_updates_count + modifications_to_be_updated_count
                    )
                    last_modification_id = dict(rows[-1])["reconsideration_request_id"]

                    logger.debug(
                        f"retrieved/linked items count: {modifications_to_be_updated_count}; total successfully linked modifications so far {successful_updates_count}; last updated reconsideration_request_id: {last_modification_id}"
                    )
                except Exception as err:
                    logger.exception(err)
                    conn.rollback()
                    failed_updates = count_total - successful_updates_count
                    last_modification_id = last_modification_id + 1

    logger.info(
        f"Finished {etl_name}: total amount of successful linked {successful_updates_count}, total failed updates {failed_updates}"
    )


def _update_application_modifications(conn, batch_size, cursor, rows):
    data = _prepare_oats_alr_applications_data(rows)

    if len(data) > 0:
        execute_batch(
            cursor,
            _get_update_query(),
            data,
            page_size=batch_size,
        )

    conn.commit()


def _get_update_query():
    query = f"""
                 UPDATE alcs.application_decision
                    SET modifies_uuid = %(modification_uuid)s
                    WHERE alcs.application_decision."uuid" = %(decision_uuid)s
    """
    return query


def _prepare_oats_alr_applications_data(row_data_list):
    data_list = []
    for row in row_data_list:
        mapped_row = {
            "modification_uuid": row["modification_uuid"],
            "decision_uuid": row["decision_uuid"],
            "reconsideration_request_id": row["reconsideration_request_id"],
        }
        data_list.append(mapped_row)

    return data_list


@inject_conn_pool
def unlink_application_modifications(conn=None):
    logger.info("Start application_modification link cleaning")
    with conn.cursor() as cursor:
        cursor.execute(
            f"""UPDATE alcs.application_decision 
                SET modifies_uuid = NULL 
                FROM alcs.application_modification 
                WHERE alcs.application_decision.modifies_uuid = application_modification.uuid 
                AND alcs.application_modification.audit_created_by = '{OATS_ETL_USER}';"""
        )
        logger.info(f"Unlinked items count = {cursor.rowcount}")

    conn.commit()
