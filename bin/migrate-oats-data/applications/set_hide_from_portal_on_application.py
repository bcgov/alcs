from common import setup_and_get_logger
from db import inject_conn_pool
from psycopg2.extras import RealDictCursor


etl_name = "set_hide_from_portal_on_application"
logger = setup_and_get_logger(etl_name)


@inject_conn_pool
def set_hide_from_portal_on_application(conn=None):
    """
    This function is responsible for setting hide_from_portal colum on application table where oats.who_create is not PROXY user

    Args:
    conn (psycopg2.extensions.connection): PostgreSQL database connection. Provided by the decorator.
    """
    logger.info(f"Start {etl_name}")

    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            count_query = f"""
                                    SELECT count(*) FROM oats.oats_alr_applications oaa 
                                    JOIN alcs.application a ON a.file_number = oaa.alr_application_id::TEXT 
                                    WHERE oaa.who_created <> 'PROXY_OATS_APPLICANT';
                                """
            cursor.execute(count_query)
            count_total = dict(cursor.fetchone())["count"]
            logger.info(f"Total application to set hide_from_portal: {count_total}")

            update_query = f"""
                                UPDATE alcs.application AS app
                                SET hide_from_portal = TRUE
                                FROM oats.oats_alr_applications AS oaa
                                WHERE app.file_number = oaa.alr_application_id::TEXT
                                    AND oaa.who_created <> 'PROXY_OATS_APPLICANT';
                            """
            cursor.execute(update_query)
            logger.info(
                f"Total hide_from_portal flag on applications updated: {cursor.rowcount}"
            )
        conn.commit()
    except Exception as err:
        logger.exception(err)
        cursor.close()
        conn.close()

    logger.info(f"Finished {etl_name}")
