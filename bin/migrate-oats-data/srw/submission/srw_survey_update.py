from common import BATCH_UPLOAD_SIZE, setup_and_get_logger, DEFAULT_ETL_USER_UUID
from db import inject_conn_pool
from psycopg2.extras import RealDictCursor, execute_batch

etl_name = "process_alcs_srw_survey_update"
logger = setup_and_get_logger(etl_name)


@inject_conn_pool
def srw_survey_plan_update(conn=None, batch_size=BATCH_UPLOAD_SIZE):
    """
    This function is responsible for updating of the notification_submission in ALCS: has_survey_plan will be set to true if document types of SURV or SRWP are present in alcs notification_documents.

    Args:
    conn (psycopg2.extensions.connection): PostgreSQL database connection. Provided by the decorator.
    batch_size (int): The number of items to process at once. Defaults to BATCH_UPLOAD_SIZE.
    """

    logger.info(f"Start {etl_name}")
    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        with open(
            "srw/sql/submission/proposal_fields/srw_survey_plan_update_count.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            count_query = sql_file.read()
            cursor.execute(count_query)
            count_total = dict(cursor.fetchone())["count"]
        logger.info(f"Total SRW data to update: {count_total}")

        failed_inserts_count = 0
        successful_updates_count = 0
        last_application_id = 0

        with open(
            "srw/sql/submission/proposal_fields/srw_survey_plan_update.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            application_sql = sql_file.read()
            while True:
                cursor.execute(
                    f"""
                        {application_sql} 
                        AND ns.file_number::INTEGER > {last_application_id} ORDER BY ns.file_number::INTEGER;
                    """
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
                    last_application_id = dict(rows[-1])["oats_application_id"]

                    logger.debug(
                        f"retrieved/updated items count: {records_to_be_updated_count}; total successfully updated SRWs so far {successful_updates_count}; last updated alr_application_id: {last_application_id}"
                    )
                except Exception as err:
                    # this is NOT going to be caused by actual data update failure. This code is only executed when the code error appears or connection to DB is lost
                    logger.exception(err)
                    conn.rollback()
                    failed_inserts_count = count_total - successful_updates_count
                    last_application_id = last_application_id + 1

    logger.info(
        f"Finished {etl_name}: total amount of successful updates {successful_updates_count}, total failed updates {failed_inserts_count}"
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
                    UPDATE
                        alcs.notification_submission
                    SET
                        has_survey_plan = %(has_survey_plan)s
                    WHERE
                        alcs.notification_submission.file_number = %(file_number)s::TEXT
"""


def _prepare_oats_data(row_data_list):
    data_list = []
    for row in row_data_list:
        data_list.append(_map_fields(dict(row)))
    return data_list


def _map_fields(data):
    return {
        "has_survey_plan": True,
        "file_number": data["oats_application_id"],
    }
