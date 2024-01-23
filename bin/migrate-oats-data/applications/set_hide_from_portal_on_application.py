from common import setup_and_get_logger
from db import inject_conn_pool
from psycopg2.extras import RealDictCursor


etl_name = "set_application_visibility"
logger = setup_and_get_logger(etl_name)


@inject_conn_pool
def set_application_visibility(conn=None):
    """This function is responsible for setting source column on application and mapping it to public portal visibility visibility."""
    _set_source_on_applications(conn)
    _set_hide_from_portal_on_application(conn)


def _set_hide_from_portal_on_application(conn):
    """
    This function is responsible for setting hide_from_portal colum on application table based on the source.

    Args:
    conn (psycopg2.extensions.connection): PostgreSQL database connection. Provided by the decorator.
    """
    logger.info(f"Start {etl_name}")

    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            count_visible_to_portal_query = f"""
                                    SELECT count(*) FROM alcs.application a 
                                    WHERE a."source" = 'APPLICANT';
                                """
            cursor.execute(count_visible_to_portal_query)
            visible_to_portal_count = dict(cursor.fetchone())["count"]

            count_hidden_from_portal_query = f"""
                                    SELECT count(*) FROM alcs.application a 
                                    WHERE a."source" <> 'APPLICANT';
                                """
            cursor.execute(count_hidden_from_portal_query)
            hidden_from_portal_count = dict(cursor.fetchone())["count"]

            count_total = visible_to_portal_count + hidden_from_portal_count

            logger.info(f"Total application to set hide_from_portal: {count_total}")

            set_hide_from_portal_false_query = f"""
                        UPDATE alcs.application 
                        SET hide_from_portal = FALSE
                        WHERE alcs.application."source" = 'APPLICANT';
                    """
            cursor.execute(set_hide_from_portal_false_query)
            updated_visible_to_portal_count = cursor.rowcount

            set_hide_from_portal_true_query = f"""
                        UPDATE alcs.application 
                        SET hide_from_portal = TRUE
                        WHERE alcs.application."source" <> 'APPLICANT';
                    """
            cursor.execute(set_hide_from_portal_true_query)
            updated_hidden_from_portal_count = cursor.rowcount

            updated_total_count = (
                updated_visible_to_portal_count + updated_hidden_from_portal_count
            )

            logger.info(
                f"Total hide_from_portal flag on applications updated: {updated_total_count}"
            )
        conn.commit()
    except Exception as err:
        logger.exception(err)
        cursor.close()
        conn.close()

    logger.info(f"Finished {etl_name}")


def _set_source_on_applications(conn):
    """"""
    logger.info(f"Start {etl_name} => set_source_on_applications")

    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            count_created_by_applicant_query = f"""    
                                SELECT count(*) FROM oats.oats_alr_applications oaa 
                                JOIN alcs.application app ON app.file_number = oaa.alr_application_id::TEXT
                                WHERE oaa.who_created = 'PROXY_OATS_APPLICANT';
                            """
            cursor.execute(count_created_by_applicant_query)
            created_by_applicant_count = dict(cursor.fetchone())["count"]

            count_created_by_oats_query = f"""    
                                SELECT count(*) FROM oats.oats_alr_applications oaa  
                                JOIN alcs.application app ON app.file_number = oaa.alr_application_id::TEXT
                                WHERE oaa.who_created <> 'PROXY_OATS_APPLICANT';
                            """
            cursor.execute(count_created_by_oats_query)
            created_by_oats_count = dict(cursor.fetchone())["count"]

            count_created_in_alcs_query = f"""    
                                SELECT count(*) FROM alcs.application a
                                WHERE a."source" <> 'APPLICANT' 
                                AND a.audit_created_by <> 'oats_etl';
                            """
            cursor.execute(count_created_in_alcs_query)
            created_by_alcs_count = dict(cursor.fetchone())["count"]

            count_total = (
                created_by_applicant_count
                + created_by_oats_count
                + created_by_alcs_count
            )

            logger.info(f"Total application to set hide_from_portal: {count_total}")

            update_created_by_applicant_query = f"""
                                UPDATE alcs.application 
                                SET "source" = 'APPLICANT'
                                FROM oats.oats_alr_applications oaa 
                                WHERE alcs.application.file_number = oaa.alr_application_id::TEXT 
                                AND oaa.who_created = 'PROXY_OATS_APPLICANT';
                            """
            cursor.execute(update_created_by_applicant_query)
            updated_created_by_applicant_count = cursor.rowcount

            update_created_by_oats_query = f"""
                                UPDATE alcs.application 
                                SET "source" = 'OATS'
                                FROM oats.oats_alr_applications oaa 
                                WHERE alcs.application.file_number = oaa.alr_application_id::TEXT 
                                AND oaa.who_created <> 'PROXY_OATS_APPLICANT';
                            """
            cursor.execute(update_created_by_oats_query)
            updated_created_by_oats_count = cursor.rowcount

            update_created_by_alcs_query = f"""
                                UPDATE alcs.application 
                                SET "source" = 'APPLICANT'
                                WHERE alcs.application."source" <> 'APPLICANT' 
                                AND alcs.application.audit_created_by <> 'oats_etl';
                            """
            cursor.execute(update_created_by_alcs_query)
            updated_created_by_alcs_count = cursor.rowcount

            total_processed = (
                updated_created_by_applicant_count
                + updated_created_by_oats_count
                + updated_created_by_alcs_count
            )

            logger.info(f"Total source on 'application' updated: {total_processed}")
        conn.commit()
    except Exception as err:
        logger.exception(err)
        cursor.close()
        conn.close()

    logger.info(f"Finished {etl_name}")
