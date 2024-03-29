from common import (
    setup_and_get_logger,
    BATCH_UPLOAD_SIZE,
)
from db import inject_conn_pool
from psycopg2.extras import RealDictCursor, execute_batch

etl_name = "update_alcs_notice_of_intent_soil_fill_fields"
logger = setup_and_get_logger(etl_name)


@inject_conn_pool
def update_alcs_notice_of_intent_soil_fill_fields(
    conn=None, batch_size=BATCH_UPLOAD_SIZE
):
    logger.info(f"Start {etl_name}")
    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        with open(
            "noi/sql/notice_of_intent_submission/soil_fields/notice_of_intent_soil_fields_update_count.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            count_query = sql_file.read()
            cursor.execute(count_query)
            count_total = dict(cursor.fetchone())["count"]
        logger.info(f"Total Notice of Intents data to update: {count_total}")

        failed_inserts_count = 0
        successful_updates_count = 0
        last_document_id = 0

        with open(
            "noi/sql/notice_of_intent_submission/soil_fields/notice_of_intent_soil_fields_update.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            application_sql = sql_file.read()
            while True:
                cursor.execute(
                    f"{application_sql} AND nois.file_number::BIGINT > {last_document_id} ORDER BY nois.file_number::BIGINT;"
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
                    last_document_id = dict(rows[-1])["file_id"]

                    logger.debug(
                        f"retrieved/updated items count: {records_to_be_updated_count}; total successfully updated notice of intents so far {successful_updates_count}; last updated alr_application_id: {last_document_id}"
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


def _update_records(conn, batch_size, cursor, rows):
    if len(rows) > 0:
        execute_batch(
            cursor,
            _update_query,
            rows,
            page_size=batch_size,
        )

    conn.commit()


_update_query = """
                    UPDATE alcs.notice_of_intent_submission 
                            SET soil_project_duration = %(fill_project_duration)s,
                                fill_project_duration = NULL
                    WHERE file_number = %(file_number)s
"""
