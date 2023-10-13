from common import setup_and_get_logger
from db import inject_conn_pool

logger = setup_and_get_logger("prod_data_obfuscation")


def process_oats_data():
    logger.info("Start oats obfuscation.")
    replace_audit_columns()


@inject_conn_pool
def replace_audit_columns(conn=None):
    proc_name = "replace_audit_columns"
    logger.info(f"Start '{proc_name}'")
    generate_update_query = """
        SELECT 'UPDATE ' || table_schema || '.' || table_name || ' SET who_created = ''obfuscated'', who_updated = ''obfuscated'';' 
        FROM information_schema.columns 
        WHERE column_name IN ('who_created', 'who_updated') AND table_schema = 'oats';
    """
    try:
        with conn.cursor() as cursor:
            cursor.execute(generate_update_query)
            update_queries = cursor.fetchall()

            for query in update_queries:
                cursor.execute(query[0])

            conn.commit()
    except:
        conn.rollback()
        logger.exception()
    finally:
        logger.info(f"Finished '{proc_name}'")
