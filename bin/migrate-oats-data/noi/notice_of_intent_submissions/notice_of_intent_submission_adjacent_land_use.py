from common import log_end, log_start, OATS_ETL_USER, AlcsAdjacentLandUseType
from db import inject_conn_pool
from common import BATCH_UPLOAD_SIZE
from psycopg2.extras import execute_batch, RealDictCursor
import traceback

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

                    _update_notice_of_intent_submissions(conn, batch_size, cursor, rows)

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
                    log_end(etl_name, str_err, trace_err)
                    failed_updates = count_total - successful_updates_count
                    last_submission_id = last_submission_id + 1

    print("Total amount of successful updated:", successful_updates_count)
    print("Total failed updates:", failed_updates)
    log_end(etl_name)


def _update_notice_of_intent_submissions(conn, batch_size, cursor, rows):
    """ """
    query = _get_update_query()
    parsed_data_list = _prepare_oats_alr_land_use_data(rows)

    if len(parsed_data_list) > 0:
        execute_batch(cursor, query, parsed_data_list, page_size=batch_size)

    conn.commit()


def _get_update_query():
    query = """
                UPDATE alcs.notice_of_intent_submission
                SET 
                    north_land_use_type = %(north_type)s,
                    north_land_use_type_description = %(north_type_description)s,
                    east_land_use_type = %(east_type)s,
                    east_land_use_type_description = %(east_type_description)s,
                    south_land_use_type = %(south_type)s,
                    south_land_use_type_description = %(south_type_description)s,
                    west_land_use_type = %(west_type)s,
                    west_land_use_type_description = %(west_type_description)s                
                WHERE
                    alcs.notice_of_intent_submission.file_number = %(alr_application_id)s::TEXT;
    """
    return query


def _prepare_oats_alr_land_use_data(row_data_list):
    data_list = []
    for row in row_data_list:
        data = _map_adjacent_land_use_data(dict(row))
        if data:
            data_list.append(data)
    return data_list


def _map_adjacent_land_use_data(oats_row):
    """"""
    compass = "cardinal_direction"
    description = "description"
    type_code = "nonfarm_use_type_code"
    alr_id = "alr_application_id"

    data = None
    if oats_row[type_code]:
        data = {"alr_application_id": oats_row[alr_id]}
        if oats_row[compass] == "EAST":
            data["east_type"] = AlcsAdjacentLandUseType[oats_row[type_code]].value
            data["east_type_description"] = oats_row[description]
        if oats_row[compass] == "WEST":
            data["west_type"] = AlcsAdjacentLandUseType[oats_row[type_code]].value
            data["west_type_description"] = oats_row[description]
        if oats_row[compass] == "SOUTH":
            data["south_type"] = AlcsAdjacentLandUseType[oats_row[type_code]].value
            data["south_type_description"] = oats_row[description]
        if oats_row[compass] == "NORTH":
            data["north_type"] = AlcsAdjacentLandUseType[oats_row[type_code]].value
            data["north_type_description"] = oats_row[description]
    return data
