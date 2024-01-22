from common import OATS_ETL_USER, setup_and_get_logger
from db import inject_conn_pool

etl_name = "update_application_covenant_submission"
logger = setup_and_get_logger(etl_name)


@inject_conn_pool
def update_covenant_area_impacted(conn=None):
    logger.info(f"Start {etl_name} area")
    update_query = f"""
                        UPDATE alcs.application_submission AS app_sub
                        SET
                            cove_area_impacted = oaac.component_area
                        FROM
                            oats.oats_alr_appl_components oaac
                        WHERE
                            app_sub.type_code = 'COVE'
                            AND app_sub.file_number = oaac.alr_application_id::TEXT 
                            AND oaac.component_area IS NOT NULL
                            AND app_sub.audit_created_by = '{OATS_ETL_USER}';
                    """

    try:
        with conn.cursor() as cursor:
            cursor.execute(update_query)
        conn.commit()
    except Exception as err:
        logger.exception()
        cursor.close()
        conn.close()

@inject_conn_pool
def update_covenant_farm_impact(conn=None):
    logger.info(f"Start {etl_name} farm")
    update_query = f"""
                        UPDATE alcs.application_submission AS app_sub
                        SET
                            cove_farm_impact = oaa.proposal_background_desc 
                        FROM
                            oats.oats_alr_applications oaa
                        WHERE
                            app_sub.type_code = 'COVE'
                            AND app_sub.file_number = oaa.alr_application_id::TEXT 
                            AND oaa.proposal_background_desc IS NOT NULL
                            AND app_sub.audit_created_by = '{OATS_ETL_USER}';
                    """

    try:
        with conn.cursor() as cursor:
            cursor.execute(update_query)
        conn.commit()
    except Exception as err:
        logger.exception()
        cursor.close()
        conn.close()

@inject_conn_pool
def update_covenant_draft(conn=None):
    logger.info(f"Start {etl_name} draft")
    update_query = f"""
                        UPDATE alcs.application_submission AS app_sub
                        SET
                            cove_has_draft = 'false'
                        WHERE
                            app_sub.type_code = 'COVE'
                            AND app_sub.cove_has_draft IS NULL
                            AND app_sub.audit_created_by = '{OATS_ETL_USER}';
                    """

    try:
        with conn.cursor() as cursor:
            cursor.execute(update_query)
        conn.commit()
    except Exception as err:
        logger.exception()
        cursor.close()
        conn.close()
