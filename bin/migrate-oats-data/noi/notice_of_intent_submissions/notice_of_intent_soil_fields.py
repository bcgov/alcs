import traceback
from common import BATCH_UPLOAD_SIZE, NO_DATA_IN_OATS, SoilChangeCode, log, log_start
from db import inject_conn_pool
from psycopg2.extras import RealDictCursor, execute_batch

etl_name = "process_alcs_notice_of_intent_soil_fields"


@inject_conn_pool
def process_alcs_notice_of_intent_soil_fields(conn=None, batch_size=BATCH_UPLOAD_SIZE):
    """
    This function is responsible for setting soil fields of the notice_of_intent_submission in ALCS.

    Args:
    conn (psycopg2.extensions.connection): PostgreSQL database connection. Provided by the decorator.
    batch_size (int): The number of items to process at once. Defaults to BATCH_UPLOAD_SIZE.
    """

    log_start(etl_name)
    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        with open(
            "noi/sql/notice_of_intent_submission/soil_fields/notice_of_intent_soil_fields_count.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            count_query = sql_file.read()
            cursor.execute(count_query)
            count_total = dict(cursor.fetchone())["count"]
        print("- Total Notice of Intents data to update: ", count_total)

        failed_inserts = 0
        successful_updates_count = 0
        last_application_id = 0

        with open(
            "noi/sql/notice_of_intent_submission/soil_fields/notice_of_intent_soil_fields.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            application_sql = sql_file.read()
            while True:
                cursor.execute(
                    f"{application_sql} WHERE oaac.alr_application_id > {last_application_id} ORDER BY oaac.alr_application_id;"
                )

                rows = cursor.fetchmany(batch_size)

                if not rows:
                    break
                try:
                    records_to_be_updated_count = len(rows)

                    _update_fee_fields_records(conn, batch_size, cursor, rows)

                    successful_updates_count = (
                        successful_updates_count + records_to_be_updated_count
                    )
                    last_application_id = dict(rows[-1])["alr_application_id"]

                    print(
                        f"retrieved/updated items count: {records_to_be_updated_count}; total successfully updated notice of intents so far {successful_updates_count}; last updated alr_application_id: {last_application_id}"
                    )
                except Exception as error:
                    # this is NOT going to be caused by actual data update failure. This code is only executed when the code error appears or connection to DB is lost
                    conn.rollback()
                    error_str = "".join(
                        traceback.format_exception(None, error, error.__traceback__)
                    )
                    print(error_str)
                    log(etl_name, str(error), error_str)
                    failed_inserts = count_total - successful_updates_count
                    last_application_id = last_application_id + 1

    print("Total amount of successful updates:", successful_updates_count)
    print("Total failed updates:", failed_inserts)
    log(etl_name)


def _update_fee_fields_records(conn, batch_size, cursor, rows):
    parsed_data_list = _prepare_oats_alr_applications_data(rows)

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


_soil_fill_query = """
                    UPDATE alcs.notice_of_intent_submission 
                    SET soil_to_place_volume = %(volume)s
                        , soil_to_place_area = %(project_area)s
                        , soil_to_place_maximum_depth = %(depth)s
                        , soil_to_place_average_depth = %(depth)s
                        , soil_fill_type_to_place  = %(type)s
                        , soil_already_placed_volume = 0
                        , soil_already_placed_area  = 0
                        , soil_already_placed_maximum_depth  = 0
                        , soil_already_placed_average_depth  = 0
                    WHERE alcs.notice_of_intent_submission.file_number = %(alr_application_id)s::text
"""

_soil_remove_query = """
                    UPDATE alcs.notice_of_intent_submission 
                    SET soil_to_remove_volume = %(volume)s
                        , soil_to_remove_area = %(project_area)s
                        , soil_to_remove_maximum_depth = %(depth)s
                        , soil_to_remove_average_depth = %(depth)s
                        , soil_type_removed  = %(type)s
                        , soil_already_removed_volume = 0
                        , soil_already_removed_area = 0
                        , soil_already_removed_maximum_depth = 0
                        , soil_already_removed_average_depth = 0
                    WHERE alcs.notice_of_intent_submission.file_number = %(alr_application_id)s::text
"""


def _prepare_oats_alr_applications_data(row_data_list):
    data_list = {SoilChangeCode.REMOVE.value: [], SoilChangeCode.ADD.value: []}
    for row in row_data_list:
        data = dict(row)
        data = map_soil_fields(data)

        if data["soil_change_code"] == SoilChangeCode.ADD.value:
            data_list[SoilChangeCode.ADD.value].append(data)
        elif data["soil_change_code"] == SoilChangeCode.REMOVE.value:
            data_list[SoilChangeCode.REMOVE.value].append(data)

    return data_list


def map_soil_fields(data):
    soil_type = data.get("material_description", "")
    soil_origin = data.get("material_origin_desc", "")

    if not soil_type and not soil_origin:
        data["type"] = NO_DATA_IN_OATS
    else:
        data["type"] = f"{soil_type} {soil_origin}"

    data["volume"] = data.get("volume", 0)
    data["project_area"] = data.get("project_area", 0)
    data["depth"] = data.get("depth", 0)

    return data
