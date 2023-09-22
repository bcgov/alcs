from db import inject_conn_pool
import traceback
from common import OATS_ETL_USER


@inject_conn_pool
def process_application_submission_status_emails(conn=None):
    update_query = f"""
                        UPDATE alcs.application_submission_to_submission_status status
                        SET email_sent_date = '0001-01-01 07:00:00.000 -0700'
                        FROM alcs.application_submission app_sub
                        WHERE status.submission_uuid = app_sub.uuid 
                            AND app_sub.audit_created_by = '{OATS_ETL_USER}'
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
                        UPDATE alcs.application_submission_to_submission_status status
                        SET email_sent_date = NULL
                        FROM alcs.application_submission app_sub
                        WHERE status.submission_uuid = app_sub.uuid 
                            AND app_sub.audit_created_by = '{OATS_ETL_USER}'
                    """
    try:
        with conn.cursor() as cursor:
            cursor.execute(update_query)
    except Exception as error:
        print("".join(traceback.format_exception(None, error, error.__traceback__)))
        cursor.close()
        conn.close()
