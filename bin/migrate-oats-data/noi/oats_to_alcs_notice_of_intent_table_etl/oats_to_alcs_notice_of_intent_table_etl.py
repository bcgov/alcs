from db import inject_conn_pool
from common import BATCH_UPLOAD_SIZE, log, log_start
from psycopg2.extras import execute_batch, RealDictCursor
import traceback
from common import AlcsAgCapSource, log, log_start, AlcsAgCap, setup_and_get_logger
from enum import Enum

etl_name = "process_alcs_notice_of_intent_base_fields"
logger = setup_and_get_logger(etl_name)


class OatsToAlcsAgCapSource(Enum):
    BCLI = AlcsAgCapSource.BCLI.value
    CLI = AlcsAgCapSource.CLI.value
    ONSI = AlcsAgCapSource.On_site.value


class OatsToAlcsAgCap(Enum):
    P = AlcsAgCap.Prime.value
    PD = AlcsAgCap.Prime_Dominant.value
    MIX = AlcsAgCap.Mixed_Prime_Secondary.value
    S = AlcsAgCap.Secondary.value
    U = AlcsAgCap.Unclassified.value


@inject_conn_pool
def process_alcs_notice_of_intent_base_fields(conn=None, batch_size=BATCH_UPLOAD_SIZE):
    """
    Import data into ALCS.notice_of_intent from OATS. ALCS.notice_of_intent.decision_date and ALCS.notice_of_intent.proposal_end_date imported separately
    """

    log_start(etl_name)
    logger.info(f"Start {etl_name}")
    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        with open(
            "noi/sql/notice_of_intent_base/notice_of_intent_base.count.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            count_query = sql_file.read()
            cursor.execute(count_query)
            count_total = dict(cursor.fetchone())["count"]

        logger.info(f"Total Notice of Intents data to update:  {count_total}")

        failed_inserts = 0
        successful_updates_count = 0
        last_application_id = 0

        with open(
            "noi/sql/notice_of_intent_base/notice_of_intent_base.sql",
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

                    _update_fee_fields_records(conn, batch_size, cursor, rows)

                    successful_updates_count = (
                        successful_updates_count + records_to_be_updated_count
                    )
                    last_application_id = dict(rows[-1])["alr_application_id"]

                    logger.debug(
                        f"retrieved/updated items count: {records_to_be_updated_count}; total successfully updated applications so far {successful_updates_count}; last updated application_id: {last_application_id}"
                    )
                except Exception as err:
                    # this is NOT going to be caused by actual data update failure. This code is only executed when the code error appears or connection to DB is lost
                    logger.exception(err)
                    conn.rollback()
                    failed_inserts = count_total - successful_updates_count
                    last_application_id = last_application_id + 1

    logger.info(
        f"Finished {etl_name}: total amount of successful updates {successful_updates_count}, total failed updates {failed_inserts}"
    )


def _update_fee_fields_records(conn, batch_size, cursor, rows):
    query = _get_update_query_from_oats_alr_applications_fields()
    parsed_data_list = _prepare_oats_alr_applications_data(rows)

    if len(parsed_data_list) > 0:
        execute_batch(cursor, query, parsed_data_list, page_size=batch_size)

    conn.commit()


def _get_update_query_from_oats_alr_applications_fields():
    query = """
                UPDATE alcs.notice_of_intent
                SET fee_paid_date = %(fee_received_date)s,
                    fee_waived = %(fee_waived_ind)s,
                    fee_amount = %(applied_fee_amt)s,
                    fee_split_with_lg = %(split_fee_with_local_gov_ind)s,
                    date_submitted_to_alc = %(submitted_to_alc_date)s,
                    staff_observations = %(staff_comment_observations)s,
                    alr_area = %(component_area)s,
                    ag_cap_source = %(capability_source_code)s,
                    ag_cap_map = %(agri_cap_map)s,
                    ag_cap_consultant = %(agri_cap_consultant)s,
                    ag_cap = %(agri_capability_code)s,
                    source = 'APPLICANT'
                WHERE
                    alcs.notice_of_intent.file_number = %(alr_application_id)s::TEXT;
            """
    return query


def _prepare_oats_alr_applications_data(row_data_list):
    data_list = []
    for row in row_data_list:
        data = dict(row)
        data = map_basic_field(data)
        data_list.append(data)
    return data_list


def map_basic_field(data):
    if data["capability_source_code"]:
        data["capability_source_code"] = str(
            OatsToAlcsAgCapSource[data["capability_source_code"]].value
        )
    if data["agri_capability_code"]:
        data["agri_capability_code"] = str(
            OatsToAlcsAgCap[data["agri_capability_code"]].value
        )
    return data
