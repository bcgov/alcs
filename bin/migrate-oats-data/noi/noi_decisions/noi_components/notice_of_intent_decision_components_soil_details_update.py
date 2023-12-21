from common import setup_and_get_logger, SoilChangeCode, NO_DATA_IN_OATS
from db import inject_conn_pool
from psycopg2.extras import RealDictCursor, execute_batch

etl_name = "update_notice_of_intent_decision_component_soil_details"
logger = setup_and_get_logger(etl_name)


@inject_conn_pool
def update_notice_of_intent_decision_component_soil_details(conn=None, batch_size=1000):
    """
    This function is responsible for updating existing the notice_of_intent_decision_component in ALCS.

    Args:
    conn (psycopg2.extensions.connection): PostgreSQL database connection. Provided by the decorator.
    batch_size (int): The number of items to process at once. Defaults to BATCH_UPLOAD_SIZE.
    """

    logger.info(f"Start {etl_name}")
    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        with open(
            "noi/sql/notice_of_intent_decisions/components/notice_of_intent_decision_components_soil_details_update_count.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            count_query = sql_file.read()
            cursor.execute(count_query)
            count_total = dict(cursor.fetchone())["count"]
        logger.info(
            f"Total Notice of Intent Decision Component data to updated: {count_total}"
        )

        failed_updates = 0
        successful_updates_count = 0
        last_component_id = 0

        with open(
            "noi/sql/notice_of_intent_decisions/components/notice_of_intent_decision_components_soil_details_update.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            query = sql_file.read()
            while True:
                cursor.execute(
                    f"""{query} 
                    WHERE noidc.oats_alr_appl_component_id > {last_component_id} ORDER BY noidc.oats_alr_appl_component_id;"""
                )

                rows = cursor.fetchmany(batch_size)

                if not rows:
                    break
                try:
                    components_to_be_updated_count = len(rows)

                    _update_soil_fields(conn, batch_size, cursor, rows)

                    successful_updates_count = (
                        successful_updates_count + components_to_be_updated_count
                    )
                    last_component_id = dict(rows[-1])["oats_alr_appl_component_id"]

                    logger.debug(
                        f"retrieved/updated items count: {components_to_be_updated_count}; total successfully update notice_of_intent_decision_components so far {successful_updates_count}; last updated oats_alr_appl_component_id: {last_component_id}"
                    )
                except Exception as err:
                    logger.exception(err)
                    conn.rollback()
                    failed_updates = count_total - successful_updates_count
                    last_component_id = last_component_id + 1

    logger.info(
        f"Finished {etl_name}: total amount of successful updates {successful_updates_count}, total failed updates {failed_updates}"
    )


_soil_fill_query = """
                    UPDATE alcs.notice_of_intent_decision_component 
                    SET soil_to_place_volume = %(volume)s
                        , soil_to_place_area = %(project_area)s
                        , soil_to_place_maximum_depth = %(depth)s
                        , soil_to_place_average_depth = %(depth)s
                        , soil_fill_type_to_place  = %(type)s
                    WHERE alcs.notice_of_intent_decision_component.oats_alr_appl_component_id = %(oats_alr_appl_component_id)s
"""

_soil_remove_query = """
                    UPDATE alcs.notice_of_intent_decision_component 
                    SET soil_to_remove_volume = %(volume)s
                        , soil_to_remove_area = %(project_area)s
                        , soil_to_remove_maximum_depth = %(depth)s
                        , soil_to_remove_average_depth = %(depth)s
                        , soil_type_removed  = %(type)s
                    WHERE alcs.notice_of_intent_decision_component.oats_alr_appl_component_id = %(oats_alr_appl_component_id)s
"""


def _update_soil_fields(conn, batch_size, cursor, rows):
    parsed_data_list = _prepare_oats_alr_decision_component_data(rows)

    if len(parsed_data_list[SoilChangeCode.REMOVE.value]) > 0:
        execute_batch(
            cursor,
            _soil_remove_query,
            parsed_data_list[SoilChangeCode.REMOVE.value],
            page_size=batch_size,
        )

    if len(parsed_data_list[SoilChangeCode.ADD.value]) > 0:
        execute_batch(
            cursor,
            _soil_fill_query,
            parsed_data_list[SoilChangeCode.ADD.value],
            page_size=batch_size,
        )

    conn.commit()


def _prepare_oats_alr_decision_component_data(row_data_list):
    data_list = {SoilChangeCode.REMOVE.value: [], SoilChangeCode.ADD.value: []}
    for row in row_data_list:
        data = map_soil_fields(row)

        if data["soil_change_code"] == SoilChangeCode.ADD.value:
            data_list[SoilChangeCode.ADD.value].append(data)
        elif data["soil_change_code"] == SoilChangeCode.REMOVE.value:
            data_list[SoilChangeCode.REMOVE.value].append(data)

    return data_list


def map_soil_fields(data):
    soil_type = data.get("material_desc", "")
    soil_origin = data.get("material_desc", "")

    if not soil_type and not soil_origin:
        data["type"] = NO_DATA_IN_OATS
    else:
        data["type"] = f"{soil_type} {soil_origin}"

    data["volume"] = data.get("volume", 0)
    data["project_area"] = data.get("project_area", 0)
    data["depth"] = data.get("depth", 0)

    return data
