import json

from common import (
    BATCH_UPLOAD_SIZE,
    OATS_ETL_USER,
    ALRChangeCode,
    setup_and_get_logger,
    OatsToAlcsNaruType,
)
from db import inject_conn_pool
from psycopg2.extras import RealDictCursor, execute_batch

from .submap import (
    add_direction_field,
    add_soil_field,
    add_subdiv,
    create_direction_dict,
    create_soil_dict,
    create_subdiv_dict,
    get_directions_rows,
    get_soil_rows,
    get_subdiv_rows,
    map_direction_values,
    map_soil_data,
    map_subdiv_lots,
    get_insert_query_for_naru,
    get_insert_query_for_nfu,
    get_insert_query,
    get_insert_query_for_inc_exc,
)

etl_name = "process_alcs_app_submissions"
logger = setup_and_get_logger(etl_name)


@inject_conn_pool
def process_alcs_app_submissions(conn=None, batch_size=BATCH_UPLOAD_SIZE):
    """
    This function is responsible for processing app_submissions in batches, updating records in the alcs.application_submissions table.

    Args:
    conn (psycopg2.extensions.connection): PostgreSQL database connection. Provided by the decorator.
    batch_size (int): The number of items to process at once. Defaults to BATCH_UPLOAD_SIZE.
    """
    logger.info(f"Start {etl_name}")
    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        with open(
            "applications/submissions/sql/app_submission_count.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            count_query = sql_file.read()
            cursor.execute(count_query)
            count_total = dict(cursor.fetchone())["count"]
        logger.info(f"Total Application Submission data to insert: {count_total}")

        failed_inserts = 0
        successful_inserts_count = 0
        last_submission_id = 0

        with open(
            "applications/submissions/sql/app_submission.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            submission_sql = sql_file.read()
            while True:
                cursor.execute(
                    f"{submission_sql} WHERE acg.alr_application_id > {last_submission_id} ORDER BY acg.alr_application_id;"
                )

                rows = cursor.fetchmany(batch_size)

                if not rows:
                    break
                try:
                    direction_data = get_direction_data(rows, cursor)
                    subdiv_data = get_subdiv_data(rows, cursor)
                    soil_data = get_soil_data(rows, cursor)

                    submissions_to_be_inserted_count = len(rows)

                    insert_app_sub_records(
                        conn,
                        batch_size,
                        cursor,
                        rows,
                        direction_data,
                        subdiv_data,
                        soil_data,
                    )

                    successful_inserts_count = (
                        successful_inserts_count + submissions_to_be_inserted_count
                    )
                    last_submission_id = dict(rows[-1])["alr_application_id"]

                    logger.debug(
                        f"retrieved/inserted items count: {submissions_to_be_inserted_count}; total successfully inserted submissions so far {successful_inserts_count}; last inserted application_id: {last_submission_id}"
                    )
                except Exception as err:
                    logger.exception()
                    conn.rollback()
                    failed_inserts = count_total - successful_inserts_count
                    last_submission_id = last_submission_id + 1

    logger.info(f"Total amount of successful inserts: {successful_inserts_count}")
    logger.info(f"Total failed inserts: {failed_inserts}")


def insert_app_sub_records(
    conn, batch_size, cursor, rows, direction_data, subdiv_data, soil_data
):
    """
    Function to insert submission records in batches.

    Args:
    conn (obj): Connection to the database.
    batch_size (int): Number of rows to execute at one time.
    cursor (obj): Cursor object to execute queries.
    rows (list): Rows of data to insert in the database.
    direction_data (dict): Dictionary of adjacent parcel data
    subdiv_data: dictionary of subdivision data lists
    soil_data: dictionary of soil element data.

    Returns:
    None: Commits the changes to the database.
    """
    (
        nfu_data_list,
        other_data_list,
        inc_exc_data_list,
        naru_data_list,
    ) = prepare_app_sub_data(rows, direction_data, subdiv_data, soil_data)

    if len(nfu_data_list) > 0:
        execute_batch(
            cursor,
            get_insert_query_for_nfu(),
            nfu_data_list,
            page_size=batch_size,
        )

    if len(inc_exc_data_list) > 0:
        execute_batch(
            cursor,
            get_insert_query_for_inc_exc(),
            inc_exc_data_list,
            page_size=batch_size,
        )

    if len(naru_data_list) > 0:
        execute_batch(
            cursor,
            get_insert_query_for_naru(),
            naru_data_list,
            page_size=batch_size,
        )

    if len(other_data_list) > 0:
        execute_batch(
            cursor,
            get_insert_query("", ""),
            other_data_list,
            page_size=batch_size,
        )

    conn.commit()


def prepare_app_sub_data(app_sub_raw_data_list, direction_data, subdiv_data, soil_data):
    """
    This function prepares different lists of data based on the 'alr_change_code' field of each data dict in 'app_sub_raw_data_list'.

    :param app_sub_raw_data_list: A list of raw data dictionaries.
    :param direction_data: A dictionary of adjacent parcel data.
    :param subdiv_data: dictionary of subdivision data lists.
    :param soil_data: dictionary of soil element data.
    :return: Five lists, each containing dictionaries from 'app_sub_raw_data_list' and 'direction_data' grouped based on the 'alr_change_code' field

    Detailed Workflow:
    - Initializes empty lists
    - Iterates over 'app_sub_raw_data_list'
        - Maps adjacent parcel data based on alr_application_id
        - Maps subdivision data on appl_component_id
        _ Maps soil data based on appl_component_id
        - Maps the basic fields of the data dictionary based on the alr_change_code
    - Returns the mapped lists
    """
    nfu_data_list = []
    inc_exc_data_list = []
    naru_data_list = []
    other_data_list = []

    for row in app_sub_raw_data_list:
        data = dict(row)
        data = add_direction_field(data)
        data = add_subdiv(data, json)
        data = add_soil_field(data)
        if data["alr_appl_component_id"] in subdiv_data:
            data = map_subdiv_lots(data, subdiv_data, json)
        if data["alr_application_id"] in direction_data:
            data = map_direction_values(data, direction_data)
        if data["alr_appl_component_id"] in soil_data:
            data = map_soil_data(data, soil_data)
        if data["alr_change_code"] == ALRChangeCode.NFU.value:
            nfu_data_list.append(data)
        elif (
            data["alr_change_code"] == ALRChangeCode.EXC.value
            or data["alr_change_code"] == ALRChangeCode.INC.value
        ):
            inc_exc_data_list.append(data)
        elif data["alr_change_code"] == ALRChangeCode.NAR.value:
            data["rsdntl_use_type_code"] = str(
                OatsToAlcsNaruType[data["rsdntl_use_type_code"]].value
            )
            naru_data_list.append(data)
        else:
            other_data_list.append(data)

    return nfu_data_list, other_data_list, inc_exc_data_list, naru_data_list


def get_direction_data(rows, cursor):
    # runs query to get direction data and creates a dict based on alr_application_id
    adj_rows = get_directions_rows(rows, cursor)
    direction_data = create_direction_dict(adj_rows)
    return direction_data


def get_subdiv_data(rows, cursor):
    # runs query to get subdivision data and creates a dictionary based on alr_appl_component_id with a list of plots
    subdiv_rows = get_subdiv_rows(rows, cursor)
    subdiv_data = create_subdiv_dict(subdiv_rows)
    return subdiv_data


def get_soil_data(rows, cursor):
    soil_rows = get_soil_rows(rows, cursor)
    soil_data = create_soil_dict(soil_rows)
    return soil_data


@inject_conn_pool
def clean_application_submission(conn=None):
    logger.info("Start application_submission cleaning")
    with conn.cursor() as cursor:
        logger.debug("Start application_submission cleaning")
        cursor.execute(
            f"DELETE FROM alcs.application_submission a WHERE a.audit_created_by = '{OATS_ETL_USER}'"
        )
        logger.info(f"Deleted items count = {cursor.rowcount}")

    conn.commit()
