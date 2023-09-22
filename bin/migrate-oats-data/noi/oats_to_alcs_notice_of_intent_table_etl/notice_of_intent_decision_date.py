from db import inject_conn_pool
from common import BATCH_UPLOAD_SIZE, log_end, log_start
from psycopg2.extras import execute_batch, RealDictCursor
import traceback


@inject_conn_pool
def process_alcs_notice_of_intent_decision_date(
    conn=None, batch_size=BATCH_UPLOAD_SIZE
):
    """
    Imports decision_date from oats to alcs.notice_of_intent.decision_date. alcs.notice_of_intent.decision_date is the date of the first decision
    In OATS the first decision date is stored in oats.oats_alr_appl_decisions. All subsequent decisions in OATS are the linked to reconsiderations and not application directly.
    """

    etl_name = "process_alcs_notice_of_intent_decision_date"
    log_start(etl_name, etl_name)
    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        with open(
            "noi/sql/notice_of_intent_base/notice_of_intent_base.count.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            count_query = sql_file.read()
            cursor.execute(count_query)
            count_total = dict(cursor.fetchone())["count"]
        print("- Total Notice of Intents data to update: ", count_total)

        failed_inserts = 0
        successful_updates_count = 0
        last_application_id = 0

        with open(
            "noi/sql/notice_of_intent_base/notice_of_intent_decision_date/notice_of_intent_decision_date.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            application_sql = sql_file.read()
            while True:
                cursor.execute(
                    f"{application_sql} WHERE decision_date_for_nois.alr_application_id > {last_application_id} ORDER BY decision_date_for_nois.alr_application_id;"
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

                    print(
                        f"retrieved/updated items count: {records_to_be_updated_count}; total successfully updated notice of intents so far {successful_updates_count}; last updated application_id: {last_application_id}"
                    )
                except Exception as error:
                    # this is NOT going to be caused by actual data update failure. This code is only executed when the code error appears or connection to DB is lost
                    conn.rollback()
                    error_str = "".join(
                        traceback.format_exception(None, error, error.__traceback__)
                    )
                    print(error_str)
                    log_end(etl_name, str(error), error_str)
                    failed_inserts = count_total - successful_updates_count
                    last_application_id = last_application_id + 1

    print("Total amount of successful updates:", successful_updates_count)
    print("Total failed updates:", failed_inserts)
    log_end(etl_name, etl_name)


def _update_fee_fields_records(conn, batch_size, cursor, rows):
    query = _get_update_query_from_oats_alr_applications_fields()
    parsed_fee_data_list = _prepare_oats_alr_applications_data(rows)

    if len(parsed_fee_data_list) > 0:
        execute_batch(cursor, query, parsed_fee_data_list, page_size=batch_size)

    conn.commit()


def _get_update_query_from_oats_alr_applications_fields():
    query = """
                UPDATE alcs.notice_of_intent
                SET decision_date = %(decision_date)s
                WHERE
                    alcs.notice_of_intent.file_number = %(alr_application_id)s::TEXT;
            """
    return query


def _prepare_oats_alr_applications_data(row_data_list):
    data_list = []
    for row in row_data_list:
        data_list.append(dict(row))
    return data_list
