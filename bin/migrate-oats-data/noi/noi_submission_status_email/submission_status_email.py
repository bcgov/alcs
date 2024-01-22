from common import OATS_ETL_USER, setup_and_get_logger
from db import inject_conn_pool

etl_name = "process_notice_of_intent_submission_status_emails"
logger = setup_and_get_logger(etl_name)


@inject_conn_pool
def process_notice_of_intent_submission_status_emails(conn=None):
    logger.info(f"Start {etl_name}")
    update_query = f"""
                        UPDATE alcs.notice_of_intent_submission_to_submission_status status
                        SET email_sent_date = '0001-01-01 07:00:00.000 -0700'
                        FROM alcs.notice_of_intent_submission noi_sub
                        WHERE status.submission_uuid = noi_sub.uuid 
                            AND noi_sub.audit_created_by = '{OATS_ETL_USER}'
                    """

    try:
        with conn.cursor() as cursor:
            cursor.execute(update_query)
        conn.commit()
    except Exception as err:
        logger.exception()
        cursor.close()
        conn.close()

    logger.info(f"Finished {etl_name}")


@inject_conn_pool
def clean_notice_of_intent_submission_status_emails(conn=None):
    update_query = f"""
                        UPDATE alcs.notice_of_intent_submission_to_submission_status status
                        SET email_sent_date = NULL
                        FROM alcs.notice_of_intent_submission noi_sub
                        WHERE status.submission_uuid = noi_sub.uuid 
                            AND noi_sub.audit_created_by = '{OATS_ETL_USER}'
                    """
    try:
        with conn.cursor() as cursor:
            cursor.execute(update_query)
    except Exception as err:
        logger.exception()
        cursor.close()
        conn.close()

    conn.commit()
