from common import BATCH_UPLOAD_SIZE, NO_DATA_IN_OATS, setup_and_get_logger
from db import inject_conn_pool
from psycopg2.extras import RealDictCursor, execute_batch

etl_name = "process_alcs_notice_of_intent_proposal_fields"
logger = setup_and_get_logger(etl_name)


@inject_conn_pool
def process_alcs_notice_of_intent_proposal_fields(
    conn=None, batch_size=BATCH_UPLOAD_SIZE
):
    """
    This function is responsible for populating of the notice_of_intent_submission in ALCS: proposal fields and soil fields populated with default values.

    Args:
    conn (psycopg2.extensions.connection): PostgreSQL database connection. Provided by the decorator.
    batch_size (int): The number of items to process at once. Defaults to BATCH_UPLOAD_SIZE.
    """

    logger.info(f"Start {etl_name}")
    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        with open(
            "noi/sql/notice_of_intent_submission/proposal_fields/notice_of_intent_proposal_fields_count.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            count_query = sql_file.read()
            cursor.execute(count_query)
            count_total = dict(cursor.fetchone())["count"]
        logger.info(f"Total Notice of Intents data to update: {count_total}")

        failed_inserts = 0
        successful_updates_count = 0
        last_application_id = 0

        with open(
            "noi/sql/notice_of_intent_submission/proposal_fields/notice_of_intent_proposal_fields.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            application_sql = sql_file.read()
            while True:
                cursor.execute(
                    f"{application_sql} WHERE oaa.alr_application_id > {last_application_id} ORDER BY oaa.alr_application_id;"
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
                    last_application_id = dict(rows[-1])["alr_application_id"]

                    logger.debug(
                        f"retrieved/updated items count: {records_to_be_updated_count}; total successfully updated notice of intents so far {successful_updates_count}; last updated alr_application_id: {last_application_id}"
                    )
                except Exception as err:
                    # this is NOT going to be caused by actual data update failure. This code is only executed when the code error appears or connection to DB is lost
                    logger.exception()
                    conn.rollback()
                    failed_inserts = count_total - successful_updates_count
                    last_application_id = last_application_id + 1

    logger.info(
        f"Finished {etl_name}: total amount of successful updates {successful_updates_count}, total failed updates {failed_inserts}"
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
                        alcs.notice_of_intent_submission
                    SET
                        purpose = %(purpose)s,
                        parcels_agriculture_description = %(current_land_use_desc)s,
                        parcels_agriculture_improvement_description= %(agricultural_improvement_desc)s,
                        parcels_non_agriculture_use_description = %(non_agricultural_uses_desc)s,
                        soil_is_follow_up = %(soil_is_follow_up)s,
                        soil_follow_up_ids = %(followup_noi_number)s,
                        soil_has_submitted_notice= %(soil_has_submitted_notice)s,
                        soil_is_extraction_or_mining = FALSE,
                        soil_is_removing_soil_for_new_structure = FALSE,
                        soil_is_area_wide_filling = FALSE,
                        created_by_uuid = %(uuid)s
                    WHERE
                        alcs.notice_of_intent_submission.file_number = %(alr_application_id)s::TEXT
"""


def _prepare_oats_data(row_data_list):
    data_list = []
    for row in row_data_list:
        data_list.append(_map_fields(dict(row)))
    return data_list


def _map_fields(data):
    summary = data.get("proposal_summary_desc", "")
    background_description = data.get("proposal_background_desc", "")

    if not summary and (not background_description or len(background_description) < 11):
        data["purpose"] = NO_DATA_IN_OATS
    else:
        data["purpose"] = f"{summary} . Background: {background_description}"

    data["soil_is_follow_up"] = data["ministry_notice_ref_no"] != None
    data["soil_has_submitted_notice"] = data["followup_noi_number"] != None

    return data
