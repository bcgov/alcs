from common import log, log_start, AlcsAdjacentLandUseType
from db import inject_conn_pool
from common import (
    BATCH_UPLOAD_SIZE,
    NO_DATA_IN_OATS,
    DateTimeEncoder,
    AdjacentLandUseDirections,
)
from psycopg2.extras import execute_batch, RealDictCursor
import traceback
import json

etl_name = "process_notice_of_intent_adjacent_land_use"


@inject_conn_pool
def process_notice_of_intent_adjacent_land_use(conn=None, batch_size=BATCH_UPLOAD_SIZE):
    """
    This function is responsible for populating adjacent_land_use from OATS to ALCS in notice_of_intent_submission table.

    Args:
    conn (psycopg2.extensions.connection): PostgreSQL database connection. Provided by the decorator.
    batch_size (int): The number of items to process at once. Defaults to BATCH_UPLOAD_SIZE.
    """

    log_start(etl_name)
    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        with open(
            "noi/sql/notice_of_intent_submission/adjacent_land_use/notice_of_intent_adjacent_land_use_count.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            count_query = sql_file.read()
            cursor.execute(count_query)
            count_total = dict(cursor.fetchone())["count"]
        print(
            "- Total Notice of Intent Submission Adjacent Land use data to update: ",
            count_total,
        )

        failed_updates = 0
        successful_updates_count = 0
        last_submission_id = 0

        with open(
            "noi/sql/notice_of_intent_submission/adjacent_land_use/notice_of_intent_adjacent_land_use.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            submission_sql = sql_file.read()
            while True:
                cursor.execute(
                    f"{submission_sql} WHERE oalu.alr_application_id > {last_submission_id} ORDER BY oalu.alr_application_id;"
                )

                rows = cursor.fetchmany(batch_size)

                if not rows:
                    break
                try:
                    submissions_to_be_updated_count = len(rows)

                    (parsed_data, raw_data) = _update_notice_of_intent_submissions(
                        conn, batch_size, cursor, rows
                    )

                    successful_updates_count = (
                        successful_updates_count + submissions_to_be_updated_count
                    )
                    last_submission_id = dict(rows[-1])["alr_application_id"]

                    print(
                        f"retrieved/updated items count: {submissions_to_be_updated_count}; total successfully processed submissions so far {successful_updates_count}; last update alr_application_id: {last_submission_id}"
                    )
                except Exception as e:
                    conn.rollback()
                    str_err = str(e)
                    trace_err = traceback.format_exc()
                    print(str_err)
                    print(trace_err)
                    failed_updates = count_total - successful_updates_count
                    last_submission_id = last_submission_id + 1
                    log(
                        etl_name,
                        str_err,
                        trace_err,
                        {
                            "parsed_data": json.dumps(parsed_data, cls=DateTimeEncoder),
                            "raw_data": json.dumps(raw_data, cls=DateTimeEncoder),
                            "last_submission_id": last_submission_id,
                        },
                    )

    print(
        "Total amount of successfully processed adjacent land uses:",
        successful_updates_count,
    )
    print("Total failed updates:", failed_updates)
    log(etl_name)


def _update_notice_of_intent_submissions(conn, batch_size, cursor, rows):
    land_use_data = _prepare_oats_alr_land_use_data(rows)
    directions = [
        AdjacentLandUseDirections.NORTH.value,
        AdjacentLandUseDirections.SOUTH.value,
        AdjacentLandUseDirections.EAST.value,
        AdjacentLandUseDirections.WEST.value,
    ]

    for direction in directions:
        if len(land_use_data[direction]) > 0:
            execute_batch(
                cursor,
                _land_use_update_queries[direction],
                land_use_data[direction],
                page_size=batch_size,
            )
        conn.commit()

    return land_use_data, rows


_land_use_update_queries = {
    AdjacentLandUseDirections.NORTH.value: """
                UPDATE alcs.notice_of_intent_submission
                SET 
                    north_land_use_type = %(north_type)s,
                    north_land_use_type_description = %(north_type_description)s
                WHERE
                    alcs.notice_of_intent_submission.file_number = %(alr_application_id)s::TEXT;
    """,
    AdjacentLandUseDirections.SOUTH.value: """
                UPDATE alcs.notice_of_intent_submission
                SET 
                    south_land_use_type = %(south_type)s,
                    south_land_use_type_description = %(south_type_description)s     
                WHERE
                    alcs.notice_of_intent_submission.file_number = %(alr_application_id)s::TEXT;
    """,
    AdjacentLandUseDirections.EAST.value: """
                UPDATE alcs.notice_of_intent_submission
                SET 
                    east_land_use_type = %(east_type)s,
                    east_land_use_type_description = %(east_type_description)s           
                WHERE
                    alcs.notice_of_intent_submission.file_number = %(alr_application_id)s::TEXT;
    """,
    AdjacentLandUseDirections.WEST.value: """
                UPDATE alcs.notice_of_intent_submission
                SET 
                    west_land_use_type = %(west_type)s,
                    west_land_use_type_description = %(west_type_description)s                
                WHERE
                    alcs.notice_of_intent_submission.file_number = %(alr_application_id)s::TEXT;
    """,
}


def _prepare_oats_alr_land_use_data(row_data_list):
    land_use_data = {
        AdjacentLandUseDirections.NORTH.value: [],
        AdjacentLandUseDirections.SOUTH.value: [],
        AdjacentLandUseDirections.EAST.value: [],
        AdjacentLandUseDirections.WEST.value: [],
    }
    compass_key = "cardinal_direction"

    for row in row_data_list:
        land_use_data[row[compass_key]].append(_map_adjacent_land_use_data(dict(row)))

    return land_use_data


def _map_adjacent_land_use_data(oats_row):
    """
    creates data input compatible with ALCS notice_of_intent_submission
    """
    compass_key = "cardinal_direction"
    description_key = "description"
    type_code_key = "nonfarm_use_type_code"
    alr_id_key = "alr_application_id"
    default_type = "OTH"

    direction = oats_row[compass_key].lower()
    direction_type_key = f"{direction}_type"
    direction_type_desc_key = f"{direction}_type_description"

    return {
        "alr_application_id": oats_row[alr_id_key],
        direction_type_key: AlcsAdjacentLandUseType[
            oats_row[type_code_key] or default_type
        ].value,
        direction_type_desc_key: oats_row[description_key] or NO_DATA_IN_OATS,
    }