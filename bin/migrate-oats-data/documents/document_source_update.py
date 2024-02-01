from common import (
    BATCH_UPLOAD_SIZE,
    setup_and_get_logger,
    add_timezone_and_keep_date_part,
    OatsToAlcsDocumentSourceCode,
)
from db import inject_conn_pool
from psycopg2.extras import RealDictCursor, execute_batch

etl_name = "update_document_source"
logger = setup_and_get_logger(etl_name)


@inject_conn_pool
def update_document_source(conn=None, batch_size=BATCH_UPLOAD_SIZE):
    """
    This function is responsible for updating source and upload date for document in ALCS.

    Args:
    conn (psycopg2.extensions.connection): PostgreSQL database connection. Provided by the decorator.
    batch_size (int): The number of items to process at once. Defaults to BATCH_UPLOAD_SIZE.
    """

    logger.info(f"Start {etl_name}")
    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        with open(
            "sql/common/document_source_update_count.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            count_query = sql_file.read()
            cursor.execute(count_query)
            count_total = dict(cursor.fetchone())["count"]
        logger.info(f"Total Document data to update: {count_total}")

        failed_inserts_count = 0
        successful_updates_count = 0
        last_document_id = 0

        with open(
            "sql/common/document_source_update.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            query = sql_file.read()
            while True:
                cursor.execute(
                    f"{query} AND od.document_id > {last_document_id} ORDER BY od.document_id;"
                )

                rows = cursor.fetchmany(batch_size)

                if not rows:
                    break
                try:
                    records_to_be_updated_count = _update_documents(
                        conn, batch_size, cursor, rows
                    )

                    successful_updates_count = (
                        successful_updates_count + records_to_be_updated_count
                    )
                    last_document_id = dict(rows[-1])["document_id"]

                    logger.debug(
                        f"Retrieved/updated items count: {records_to_be_updated_count}; total successfully updated documents so far {successful_updates_count}; last updated document_id: {last_document_id}"
                    )
                except Exception as err:
                    # this is NOT going to be caused by actual data update failure. This code is only executed when the code error appears or connection to DB is lost
                    logger.exception()
                    conn.rollback()
                    failed_inserts_count = count_total - successful_updates_count
                    last_document_id = last_document_id + 1

    logger.info(
        f"Finished {etl_name}: total amount of successful updates {successful_updates_count}, total failed updates {failed_inserts_count}"
    )


def _update_documents(conn, batch_size, cursor, rows):
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
                    UPDATE alcs.document 
                    SET uploaded_at = %(file_upload_date)s, source = %(file_source)s
                    WHERE alcs.document.oats_document_id = %(document_id)s::TEXT
"""

def _prepare_data_to_insert(row_data_list):
    data_list = []
    for row in row_data_list:
        mapped_row = _map_data(row)
        data_list.append(mapped_row)

    return data_list

def _map_data(row):
    return {
        "document_id": row.get("document_id"),
        "file_upload_date": _get_upload_date(row),
        "file_source": _get_document_source(row)
        
    }

def _get_upload_date(data):
    upload_date = data.get("uploaded_date", "")
    created_date = data.get("when_created", "")
    if upload_date:
        return add_timezone_and_keep_date_part(upload_date)
    else:
        return add_timezone_and_keep_date_part(created_date)

def _get_document_source(data):
    source = data.get("document_source_code", "")
    alcs_source = data.get("source", "")
    if alcs_source != 'oats_etl' and alcs_source:
        return alcs_source
    elif source:
        source = str(
                OatsToAlcsDocumentSourceCode[source].value
            )

    return source