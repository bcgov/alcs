from common import (
    log_end,
    log_start,
)

from db import inject_conn_pool
from constants import BATCH_UPLOAD_SIZE
from psycopg2.extras import execute_batch, RealDictCursor
import traceback
from enum import Enum

etl_name = "alcs_app_populate"

@inject_conn_pool
def process_alcs_application_prep_fields(conn=None, batch_size=BATCH_UPLOAD_SIZE):
    """
    This function is responsible for processing applications in batches, updating records in the alcs.application table.

    Args:
    conn (psycopg2.extensions.connection): PostgreSQL database connection. Provided by the decorator.
    batch_size (int): The number of items to process at once. Defaults to BATCH_UPLOAD_SIZE.
    """

    log_start(etl_name)
    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        with open(
            "applications/sql/application-populate/application_pop_fee_update_count.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            count_query = sql_file.read()
            cursor.execute(count_query)
            count_total = dict(cursor.fetchone())["count"]
        print("- Total Application Prep data to insert: ", count_total)

        failed_inserts = 0
        successful_updates_count = 0
        last_application_id = 0

        with open(
            "applications/sql/application-populate/application_pop_fee.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            application_sql = sql_file.read()
            while True:
                cursor.execute(
                    f"{application_sql} WHERE acg.alr_application_id > {last_application_id} ORDER BY acg.alr_application_id;"
                )

                rows = cursor.fetchmany(batch_size)

                if not rows:
                    break
                try:
                    applications_to_be_updated_count = len(rows)

                    update_application_records(conn, batch_size, cursor, rows)

                    successful_updates_count = (
                        successful_updates_count + applications_to_be_updated_count
                    )
                    last_application_id = dict(rows[-1])["alr_application_id"]

                    print(
                        f"retrieved/updated items count: {applications_to_be_updated_count}; total successfully updated applications so far {successful_updates_count}; last updated application_id: {last_application_id}"
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

def update_application_records(conn, batch_size, cursor, rows):
    """
    Function to update application records in batches.

    Args:
    conn (obj): Connection to the database.
    batch_size (int): Number of rows to execute at one time.
    cursor (obj): Cursor object to execute queries.
    rows (list): Rows of data to update in the database.

    Returns:
    None: Commits the changes to the database.
    """
    execute_batch(cursor, get_update_query_for_fee(), )

def get_update_query_for_fee():
    query = """
                UPDATE alcs.application
                SET fee_amount =
                    fee_waived =
                    fee_split_with_lg = 
                    """