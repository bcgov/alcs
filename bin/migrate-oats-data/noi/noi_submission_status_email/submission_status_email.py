from db import inject_conn_pool
import traceback
from common import OATS_ETL_USER


@inject_conn_pool
def process_notice_of_intent_submission_status_emails(conn=None):
    update_query = f"""
                        UPDATE notice_of_intent_submission_to_submission_status status
                        SET email_sent_date = '0001-01-01 01:00:00.000 -0700'
                        FROM notice_of_intent_submission noi_sub
                        WHERE status.submission_uuid = noi_sub.uuid 
                            AND noi_sub.audit_created_by = {OATS_ETL_USER}
                    """

    try:
        with conn.cursor() as cursor:
            cursor.execute(update_query)
    except Exception as error:
        print("".join(traceback.format_exception(None, error, error.__traceback__)))
        cursor.close()
        conn.close()


@inject_conn_pool
def clean_application_submission_status_emails(conn=None):
    update_query = f"""
                        UPDATE notice_of_intent_submission_to_submission_status status
                        SET email_sent_date = '0001-01-01 01:00:00.000 -0700'
                        FROM notice_of_intent_submission noi_sub
                        WHERE status.submission_uuid = noi_sub.uuid 
                            AND noi_sub.audit_created_by = {OATS_ETL_USER}
                    """
    try:
        with conn.cursor() as cursor:
            cursor.execute(update_query)
    except Exception as error:
        print("".join(traceback.format_exception(None, error, error.__traceback__)))
        cursor.close()
        conn.close()
