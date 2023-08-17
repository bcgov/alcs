from common import (
    ALRChangeCode,
    log_end,
    log_start,
)
from db import inject_conn_pool
from constants import BATCH_UPLOAD_SIZE
from psycopg2.extras import execute_batch, RealDictCursor
import traceback
from enum import Enum

etl_name = "alcs_app_sub"

@inject_conn_pool
def process_alcs_app_submissions(conn=None, batch_size=BATCH_UPLOAD_SIZE):
    """
    This function is responsible for processing app_submissions in batches, updating records in the alcs.application_submissions table.

    Args:
    conn (psycopg2.extensions.connection): PostgreSQL database connection. Provided by the decorator.
    batch_size (int): The number of items to process at once. Defaults to BATCH_UPLOAD_SIZE.
    """

    log_start(etl_name)
    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        with open(
            "submissions/sql/app_submission_count.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            count_query = sql_file.read()
            cursor.execute(count_query)
            count_total = dict(cursor.fetchone())["count"]
        print("- Total Application Submission data to insert: ", count_total)

        failed_inserts = 0
        successful_updates_count = 0
        last_application_id = 0

        with open(
            "submissions/sql/app_submission.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            application_sql = sql_file.read()
            while True:
                cursor.execute(
                    f"{application_sql} WHERE aps.file_number > {last_application_id} ORDER BY aps.file_number;"
                )

                rows = cursor.fetchmany(batch_size)

                if not rows:
                    break
                try:
                    applications_to_be_updated_count = len(rows)

                    update_app_sub_records(conn, batch_size, cursor, rows)

                    successful_updates_count = (
                        successful_updates_count + applications_to_be_updated_count
                    )
                    last_application_id = dict(rows[-1])["file_number"]

                    print(
                        f"retrieved/updated items count: {applications_to_be_updated_count}; total successfully updated submissions so far {successful_updates_count}; last updated application_id: {last_application_id}"
                    )
                except Exception as e:
                    # this is NOT going to be caused by actual data update failure. This code is only executed when the code error appears or connection to DB is lost
                    conn.rollback()
                    str_err = str(e)
                    trace_err = traceback.format_exc()
                    print(str_err)
                    print(trace_err)
                    log_end(etl_name, str_err, trace_err)
                    failed_inserts = count_total - successful_updates_count
                    last_application_id = last_application_id + 1

    print("Total amount of successful updates:", successful_updates_count)
    print("Total failed updates:", failed_inserts)
    log_end(etl_name)

def update_app_sub_records(conn, batch_size, cursor, rows):
    """
    Function to update submission records in batches.

    Args:
    conn (obj): Connection to the database.
    batch_size (int): Number of rows to execute at one time.
    cursor (obj): Cursor object to execute queries.
    rows (list): Rows of data to update in the database.

    Returns:
    None: Commits the changes to the database.
    """
    (
        nfu_data_list,
        nar_data_list,
        other_data_list,
        exc_data_list,
        inc_data_list,
    ) = prepare_app_sub_data(rows)

    if len(nfu_data_list) > 0:
        execute_batch(
            cursor,
            get_update_query_for_nfu(),
            nfu_data_list,
            page_size=batch_size,
        )

    if len(nar_data_list) > 0:
        execute_batch(
            cursor,
            get_update_query_for_nar(),
            nar_data_list,
            page_size=batch_size,
        )

    if len(exc_data_list) > 0:
        execute_batch(
            cursor,
            get_update_query_for_exc(),
            exc_data_list,
            page_size=batch_size,
        )

    if len(inc_data_list) > 0:
        execute_batch(
            cursor,
            get_update_query_for_inc(),
            inc_data_list,
            page_size=batch_size,
        )

    if len(other_data_list) > 0:
        execute_batch(
            cursor,
            get_update_query_for_other(),
            other_data_list,
            page_size=batch_size,
        )

    conn.commit()

def prepare_app_sub_data(app_sub_raw_data_list):
    """
    This function prepares different lists of data based on the 'alr_change_code' field of each data dict in 'app_prep_raw_data_list'.

    :param app_prep_raw_data_list: A list of raw data dictionaries.
    :return: Five lists, each containing dictionaries from 'app_prep_raw_data_list' grouped based on the 'alr_change_code' field

    Detailed Workflow:
    - Initializes empty lists
    - Iterates over 'app_prep_raw_data_list'
        - Maps the basic fields of the data dictionary based on the alr_change_code
    - Returns the mapped lists
    """
    nfu_data_list = []
    nar_data_list = []
    exc_data_list = []
    inc_data_list = []
    other_data_list = []

    for row in app_sub_raw_data_list:
        data = dict(row)
        # data = map_basic_field(data)

        if data["alr_change_code"] == ALRChangeCode.NFU.value:
            # data = mapOatsToAlcsAppPrep(data)
            nfu_data_list.append(data)
        elif data["alr_change_code"] == ALRChangeCode.NAR.value:
            nar_data_list.append(data)
        elif data["alr_change_code"] == ALRChangeCode.EXC.value:
            # data = mapOatsToAlcsLegislationCode(data)
            exc_data_list.append(data)
        elif data["alr_change_code"] == ALRChangeCode.INC.value:
            # data = mapOatsToAlcsLegislationCode(data)
            inc_data_list.append(data)
        else:
            other_data_list.append(data)

    return nfu_data_list, nar_data_list, other_data_list, exc_data_list, inc_data_list


def get_update_query(unique_fields):
    # unique_fields takes input from called function and appends to query
    query = """
                INSERT INTO alcs.application_submission
                VALUES file_number = %(file_number)s,
                    local_government_uuid = %(local_government_uuid)s,
                    type_code = %(type_code)s,
                    subd_proposed_lots = jsonb_build_array(empty,1),
                    is_draft = false
                    {unique_fields}
    """
    return query.format(unique_fields=unique_fields)

def get_update_query_for_nfu():
    unique_fields = """"""
    return get_update_query(unique_fields)

def get_update_query_for_nar():
    # naruSubtype is a part of submission, import there
    unique_fields = """"""
    return get_update_query(unique_fields)


def get_update_query_for_exc():
    unique_fields = """"""
    return get_update_query(unique_fields)


def get_update_query_for_inc():
    unique_fields = """"""
    return get_update_query(unique_fields)


def get_update_query_for_other():
    # leaving blank insert for now
    unique_fields = """"""
    return get_update_query(unique_fields)



# def map_basic_field(data):
#     if data["capability_source_code"]:
#         data["capability_source_code"] = str(
#             OatsToAlcsAgCapSource[data["capability_source_code"]].value
#         )
#     if data["agri_capability_code"]:
#         data["agri_capability_code"] = str(
#             OatsToAlcsAgCap[data["agri_capability_code"]].value
#         )

#     return data