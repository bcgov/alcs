from common import (
    setup_and_get_logger,
    BATCH_UPLOAD_SIZE,
    OatsToAlcsDecisionMakerCodeMappingEnum,
)
from db import inject_conn_pool
from psycopg2.extras import RealDictCursor, execute_batch

etl_name = "update_application_decision"
logger = setup_and_get_logger(etl_name)


@inject_conn_pool
def update_application_decision(conn=None, batch_size=BATCH_UPLOAD_SIZE):
    """
    This function is responsible for updating application_decision.decision_maker_code in ALCS.

    Args:
    conn (psycopg2.extensions.connection): PostgreSQL database connection. Provided by the decorator.
    batch_size (int): The number of items to process at once. Defaults to BATCH_UPLOAD_SIZE.
    """

    logger.info(f"Start {etl_name}")
    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        with open(
            "applications/decisions/sql/application_decision_update_count.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            count_query = sql_file.read()
            cursor.execute(count_query)
            count_total = dict(cursor.fetchone())["count"]
        logger.info(f"Total Application decision data to updated: {count_total}")

        failed_updates = 0
        successful_updates_count = 0
        last_decision_id = 0

        with open(
            "applications/decisions/sql/application_decision_update.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            query = sql_file.read()
            while True:
                cursor.execute(
                    f"""
                        {query} 
                        and ad.oats_alr_appl_decision_id > {last_decision_id} ORDER BY ad.oats_alr_appl_decision_id;"""
                )

                rows = cursor.fetchmany(batch_size)

                if not rows:
                    break
                try:
                    decisions_to_be_updated_count = len(rows)

                    _update_application_decision(conn, batch_size, cursor, rows)

                    successful_updates_count = (
                        successful_updates_count + decisions_to_be_updated_count
                    )
                    last_decision_id = dict(rows[-1])["oats_alr_appl_decision_id"]

                    logger.debug(
                        f"retrieved/updated items count: {decisions_to_be_updated_count}; total successfully update decisions so far {successful_updates_count}; last updated decision_id: {last_decision_id}"
                    )
                except Exception as err:
                    logger.exception(err)
                    conn.rollback()
                    failed_updates = count_total - successful_updates_count
                    last_decision_id = last_decision_id + 1

    logger.info(
        f"Finished {etl_name}: total amount of successful updates {successful_updates_count}, total failed updates {failed_updates}"
    )


def _update_application_decision(conn, batch_size, cursor, rows):
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
                SET decision_maker_code = %(decision_maker_code)s
                WHERE alcs.application_decision."uuid" = %(decision_uuid)s;
    """
    return query


def _prepare_oats_alr_applications_data(row_data_list):
    data_list = []
    for row in row_data_list:
        mapped_row = {
            "decision_uuid": row["decision_uuid"],
            "decision_maker_code": _map_decision_maker_code(row),
        }
        data_list.append(mapped_row)

    return data_list


def _map_decision_maker_code(row):
    accomplishment_code = row["accomplishment_code"]
    if accomplishment_code is not None:
        for decision_maker_code_enum in OatsToAlcsDecisionMakerCodeMappingEnum:
            if decision_maker_code_enum.name == accomplishment_code:
                if (
                    decision_maker_code_enum.value
                    == OatsToAlcsDecisionMakerCodeMappingEnum.ALD.value
                ):
                    return OatsToAlcsDecisionMakerCodeMappingEnum.ACD.value  # ALCS code
                else:
                    return decision_maker_code_enum.value
    return None
