from common import (
    setup_and_get_logger,
    BATCH_UPLOAD_SIZE,
)
from db import inject_conn_pool
from psycopg2.extras import RealDictCursor, execute_batch

etl_name = "link_notice_of_intent_primary_contacts"
logger = setup_and_get_logger(etl_name)


@inject_conn_pool
def link_notice_of_intent_primary_contacts(conn=None, batch_size=BATCH_UPLOAD_SIZE):
    logger.info(f"Start {etl_name}")
    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        with open(
            "noi/sql/notice_of_intent_submission/primary_contact/notice_of_intent_submission_primary_contact_count.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            count_query = sql_file.read()
            cursor.execute(count_query)
            count_total = dict(cursor.fetchone())["count"]
        logger.info(f"Total Notice of Intents data to update: {count_total}")

        failed_updates = 0
        successful_updates_count = 0
        last_file_number = 0

        with open(
            "noi/sql/notice_of_intent_submission/primary_contact/notice_of_intent_submission_primary_contact.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            application_sql = sql_file.read()
            while True:
                cursor.execute(
                    f"{application_sql} WHERE nois.file_number::bigint > '{last_file_number}' ORDER BY nois.file_number::bigint;"
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

                    last_record = dict(rows[-1])
                    last_file_number = last_record["file_number"]

                    logger.debug(
                        f"retrieved/updated items count: {records_to_be_updated_count}; total successfully set notice of intents primary contacts so far {successful_updates_count}; last set {last_file_number}"
                    )
                except Exception as err:
                    logger.exception(err)
                    conn.rollback()
                    failed_updates = count_total - successful_updates_count
                    last_file_number = last_file_number + 1

    logger.info(
        f"Finished {etl_name}: total amount of successful updates {successful_updates_count}, total failed updates {failed_updates}"
    )


def _update_records(conn, batch_size, cursor, rows):
    parsed_data_list = _prepare_oats_data(rows)

    if len(parsed_data_list) > 0:
        execute_batch(
            cursor,
            _update_query,
            parsed_data_list,
            page_size=batch_size,
        )

    conn.commit()


_update_query = """
                    UPDATE alcs.notice_of_intent_submission 
                    SET 
                        primary_contact_owner_uuid = %(owner_uuid)s
                    WHERE
                        alcs.notice_of_intent_submission.file_number = %(file_number)s::TEXT
"""


def _prepare_oats_data(row_data_list):
    data_list = []
    for row in row_data_list:
        data_list.append(dict(row))
    return data_list
