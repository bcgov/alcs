from common import (
    setup_and_get_logger,
    BATCH_UPLOAD_SIZE,
)
from db import inject_conn_pool
from psycopg2.extras import RealDictCursor, execute_batch

etl_name = "process_application_certificate_of_title"
logger = setup_and_get_logger(etl_name)


@inject_conn_pool
def process_application_certificate_of_title(conn=None, batch_size=BATCH_UPLOAD_SIZE):
    logger.info(f"Start {etl_name}")
    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        with open(
            "applications/submissions/sql/parcels/application_certificate_of_title_count.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            count_query = sql_file.read()
            cursor.execute(count_query)
            count_total = dict(cursor.fetchone())["count"]
        logger.info(f"Total Application data to update: {count_total}")

        failed_inserts = 0
        successful_updates_count = 0
        last_document_id = 0

        with open(
            "applications/submissions/sql/parcels/application_certificate_of_title.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            application_sql = sql_file.read()
            while True:
                cursor.execute(
                    f"{application_sql} AND od.document_id > {last_document_id} ORDER BY od.document_id;"
                )

                rows = cursor.fetchmany(batch_size)

                if not rows:
                    break
                try:
                    records_to_be_updated_count = len(rows)

                    _update_records(conn, batch_size, cursor, rows)

                    successful_updates_count = (
                        successful_updates_count + records_to_be_updated_count
                    )
                    last_document_id = dict(rows[-1])["document_id"]

                    logger.debug(
                        f"retrieved/updated items count: {records_to_be_updated_count}; total successfully updated applications so far {successful_updates_count}; last updated alr_application_id: {last_document_id}"
                    )
                except Exception as err:
                    # this is NOT going to be caused by actual data update failure. This code is only executed when the code error appears or connection to DB is lost
                    logger.exception()
                    conn.rollback()
                    failed_inserts = count_total - successful_updates_count
                    last_document_id = last_document_id + 1

    logger.info(
        f"Finished {etl_name}: total amount of successful updates {successful_updates_count}, total failed updates {failed_inserts}"
    )


def _update_records(conn, batch_size, cursor, rows):
    # parsed_data_list = _prepare_oats_data(rows)

    if len(rows) > 0:
        execute_batch(
            cursor,
            _update_query,
            rows,
            page_size=batch_size,
        )

    conn.commit()


_update_query = """
                    UPDATE alcs.application_parcel 
                            SET certificate_of_title_uuid  = %(document_uuid)s
                    WHERE oats_subject_property_id = %(subject_property_id)s
"""
