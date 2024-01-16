from common import OATS_ETL_USER, setup_and_get_logger
from db import inject_conn_pool

etl_name = "populate_default_staff_journal_user"
logger = setup_and_get_logger(etl_name)

_new_oats_user_uuid = "ca8e91dc-cfb0-45c3-a443-8e47e44591df"


@inject_conn_pool
def populate_default_staff_journal_user(conn=None):
    logger.info(f"Start {etl_name}")

    insert_user_query = f"""
                        INSERT INTO alcs."user" (uuid, audit_created_by,email,display_name,preferred_username,"name",given_name,family_name, identity_provider) 
                        VALUES ('{_new_oats_user_uuid}', '{OATS_ETL_USER}','11@11','Oats ETL','Oats ETL','Oats ETL','Oats','ETL', 'etl')
                        ON CONFLICT DO NOTHING;
                    """
    set_user_to_journal_records_query = f"""
                        UPDATE alcs.staff_journal 
                        SET author_uuid = '{_new_oats_user_uuid}'
                        WHERE author_uuid IS NULL AND staff_journal.audit_created_by = '{OATS_ETL_USER}';
                    """
    try:
        with conn.cursor() as cursor:
            cursor.execute(insert_user_query)
            cursor.execute(set_user_to_journal_records_query)
        conn.commit()
    except Exception as err:
        logger.exception()
        cursor.close()
        conn.close()

    logger.info(f"Finished {etl_name}")


@inject_conn_pool
def clean_staff_journal_users(conn=None):
    logger.info(f"Start cleaning staff journal user")
    update_query = f"""
                        UPDATE alcs.staff_journal 
                        SET author_uuid = NULL
                        WHERE author_uuid IS NULL AND staff_journal.audit_created_by = '{OATS_ETL_USER}';
                    """
    delete_query = f"""
                    DELETE FROM alcs.staff_journal 
                    WHERE uuid='{_new_oats_user_uuid}'
                    """
    try:
        with conn.cursor() as cursor:
            cursor.execute(update_query)
            cursor.execute(delete_query)
    except Exception as err:
        logger.exception()
        cursor.close()
        conn.close()

    conn.commit()
    logger.info(f"Finished cleaning staff journal user")
