from common import (
    BATCH_UPLOAD_SIZE,
    setup_and_get_logger,
    add_timezone_and_keep_date_part,
)
from db import inject_conn_pool
from psycopg2.extras import RealDictCursor, execute_batch

etl_name = "update_submission_fill_import"
logger = setup_and_get_logger(etl_name)


@inject_conn_pool
def update_submission_fill_import(conn=None, batch_size=BATCH_UPLOAD_SIZE):
    """
    This function is responsible for updating will_import_fill fields for submission in ALCS.

    Args:
    conn (psycopg2.extensions.connection): PostgreSQL database connection. Provided by the decorator.
    batch_size (int): The number of items to process at once. Defaults to BATCH_UPLOAD_SIZE.
    """

    logger.info(f"Start {etl_name}")
    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        with open(
            "applications/submissions/sql/app_submission_fill_update_count.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            count_query = sql_file.read()
            cursor.execute(count_query)
            count_total = dict(cursor.fetchone())["count"]
        logger.info(f"Total Submission data to update: {count_total}")

        failed_inserts_count = 0
        successful_updates_count = 0
        last_application_id = 0

        with open(
            "applications/submissions/sql/app_submission_fill_update.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            query = sql_file.read()
            while True:
                cursor.execute(
                    f"{query} AND oaac.alr_application_id > {last_application_id} ORDER BY oaac.alr_application_id;"
                )

                rows = cursor.fetchmany(batch_size)

                if not rows:
                    break
                try:
                    records_to_be_updated_count = _update_submissions(
                        conn, batch_size, cursor, rows
                    )

                    successful_updates_count = (
                        successful_updates_count + records_to_be_updated_count
                    )
                    last_application_id = dict(rows[-1])["alr_application_id"]

                    logger.debug(
                        f"Retrieved/updated items count: {records_to_be_updated_count}; total successfully updated submissions so far {successful_updates_count}; last updated application_id: {last_application_id}"
                    )
                except Exception as err:
                    # this is NOT going to be caused by actual data update failure. This code is only executed when the code error appears or connection to DB is lost
                    logger.exception()
                    conn.rollback()
                    failed_inserts_count = count_total - successful_updates_count
                    last_application_id = last_application_id + 1

    logger.info(
        f"Finished {etl_name}: total amount of successful updates {successful_updates_count}, total failed updates {failed_inserts_count}"
    )


def _update_submissions(conn, batch_size, cursor, rows):
    parsed_data_list = _prepare_data_to_insert(rows)
    actual_inserts = len(parsed_data_list)
    execute_batch(
        cursor,
        _document_update_query,
        parsed_data_list,
        page_size=batch_size,
    )

    conn.commit()
    return actual_inserts

_document_update_query = """
                    UPDATE alcs.application_submission 
                    SET nfu_will_import_fill = %(nfu_fill)s, naru_will_import_fill = %(naru_fill)s
                    WHERE alcs.application_submission.file_number = %(alr_application_id)s::TEXT
"""

def _prepare_data_to_insert(row_data_list):
    data_list = []
    for row in row_data_list:
        mapped_row = _map_data(row)
        data_list.append(mapped_row)

    return data_list

def _map_data(row):
    return {
        "alr_application_id": row.get("alr_application_id"),
        "nfu_fill": _get_nfu(row),
        "naru_fill": _get_naru(row)
        
    }

def _get_nfu(data):
    import_fill = data.get("material_need_ind", "")
    type_code = data.get("type_code", "")
    if type_code == "NFUP":
        if import_fill == 'Y':
            return True
        elif import_fill =='N':
            return False 
    else:
        return None

def _get_naru(data):
    import_fill = data.get("material_need_ind", "")
    type_code = data.get("type_code", "")
    if type_code == "NARU":
        if import_fill == 'Y':
            return True
        elif import_fill =='N':
            return False 
    else:
        return None