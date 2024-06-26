from common import setup_and_get_logger
from db import inject_conn_pool
from ..lorem_ipsum import lorem_ipsum_string
from faker import Faker
from ..utils import log_process, lorem_ipsum_function_query, get_update_column_query

from .application import obfuscate_application_related_data
from .covenant import obfuscate_covenant_related_data
from .notice_of_intent import obfuscate_notice_of_intent_related_data
from .notification import obfuscate_notification_related_data
from .planning_review import obfuscate_pr_related_data
from .inquiry import obfuscate_inquiry_related_data

logger = setup_and_get_logger("prod_data_obfuscation")


def process_alcs_data():
    logger.info("Start alcs obfuscation.")
    # common
    _update_description_columns()
    _delete_data_from_tables()
    _update_body_columns()
    _update_comment_columns()

    _update_with_random_alcs_users()
    _update_with_random_alcs_documents()
    _update_with_random_alcs_message()

    _update_with_random_alcs_local_government()

    obfuscate_application_related_data()

    obfuscate_covenant_related_data()

    obfuscate_notice_of_intent_related_data()

    obfuscate_notification_related_data()

    obfuscate_inquiry_related_data()

    obfuscate_pr_related_data()


@log_process(logger, "update_description_columns")
@inject_conn_pool
def _update_description_columns(conn=None):
    create_proc_sql = f"""
    {lorem_ipsum_function_query}

    CREATE OR REPLACE FUNCTION update_description_schema() RETURNS VOID AS $$
    DECLARE
        r RECORD;
    BEGIN
        FOR r IN (SELECT * FROM information_schema.columns WHERE column_name LIKE '%description%' and (data_type='text' or data_type like 'character varying') AND table_schema = 'alcs' AND table_name NOT LIKE '%code' AND table_name NOT LIKE '%type' and table_name not in ('application_status', 'card_status') and table_name not ilike '%view%') LOOP
            EXECUTE format('UPDATE alcs.%s SET %s = random_lorem_ipsum() WHERE %s IS NOT NULL', r.table_name, r.column_name, r.column_name);
        END LOOP;
    END;
    $$ LANGUAGE plpgsql;
    """

    execute_proc_sql = "SELECT update_description_schema();"

    try:
        with conn.cursor() as cursor:
            cursor.execute(create_proc_sql)
            cursor.execute(execute_proc_sql)
            conn.commit()
    except Exception as err:
        conn.rollback()
        logger.exception(err)


@log_process(logger, "delete_data_from_tables")
@inject_conn_pool
def _delete_data_from_tables(conn=None):
    # List of tables from which you want to delete data
    table_names = ["alcs.comment_mention", "alcs.email_status"]

    try:
        with conn.cursor() as cursor:
            for table_name in table_names:
                # Check if such a table exists before attempting to delete
                check_table_exists_qry = f"SELECT to_regclass('{table_name}');"
                del_query = f"DELETE FROM {table_name};"

                cursor.execute(check_table_exists_qry)
                if cursor.fetchone()[0] is not None:
                    cursor.execute(del_query)
                else:
                    logger.info(f"'{table_name}' does not exist.")

            conn.commit()

    except Exception as err:
        logger.exception(err)


@log_process(logger, "update_body_columns")
@inject_conn_pool
def _update_body_columns(conn=None):
    create_proc_sql = f"""
    {lorem_ipsum_function_query}

    CREATE OR REPLACE FUNCTION update_body_columns() RETURNS VOID AS $$
    DECLARE
        r RECORD;
    BEGIN
        FOR r IN (SELECT * FROM information_schema.columns WHERE column_name LIKE 'body' and (data_type='text' or data_type like 'character varying') AND table_schema = 'alcs' AND table_name NOT LIKE '%code' AND table_name NOT LIKE '%type') LOOP
            EXECUTE format('UPDATE alcs.%s SET %s = random_lorem_ipsum() WHERE %s IS NOT NULL', r.table_name, r.column_name, r.column_name);
        END LOOP;
    END;
    $$ LANGUAGE plpgsql;
    """

    execute_proc_sql = "SELECT update_body_columns();"

    try:
        with conn.cursor() as cursor:
            cursor.execute(create_proc_sql)
            cursor.execute(execute_proc_sql)
            conn.commit()
    except Exception as err:
        conn.rollback()
        logger.exception(err)


@log_process(logger, "update_comment_columns")
@inject_conn_pool
def _update_comment_columns(conn=None):
    create_proc_sql = f"""
    {lorem_ipsum_function_query}

    CREATE OR REPLACE FUNCTION update_comment_columns() RETURNS VOID AS $$
    DECLARE
        r RECORD;
    BEGIN
        FOR r IN (SELECT * FROM information_schema.columns WHERE column_name like '%comment%' and (data_type='text' or data_type like 'character varying') AND table_schema = 'alcs') LOOP
            EXECUTE format('UPDATE alcs.%s SET %s = random_lorem_ipsum() WHERE %s IS NOT NULL', r.table_name, r.column_name, r.column_name);
        END LOOP;
    END;
    $$ LANGUAGE plpgsql;
    """

    execute_proc_sql = "SELECT update_comment_columns();"

    try:
        with conn.cursor() as cursor:
            cursor.execute(create_proc_sql)
            cursor.execute(execute_proc_sql)
            conn.commit()
    except Exception as err:
        conn.rollback()
        logger.exception(err)


@log_process(logger, "update_with_random_alcs_users")
@inject_conn_pool
def _update_with_random_alcs_users(conn=None):
    # Set Faker for generating random names
    fake = Faker()

    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT uuid FROM alcs.user")
            record_ids = cursor.fetchall()

            for r_id in record_ids:
                sql_query = """
                            UPDATE alcs.user 
                            SET email = '11@11', 
                                display_name = %s, 
                                preferred_username = %s, 
                                given_name = %s,
                                family_name = %s,
                                idir_user_name = %s, 
                                bceid_user_name = %s,
                                business_name = %s,
                                settings = NULL,
                                client_roles = '{LUP}'
                            WHERE uuid = %s;
                """
                cursor.execute(
                    sql_query,
                    (
                        fake.user_name(),
                        fake.user_name(),
                        fake.first_name(),
                        fake.last_name(),
                        fake.user_name(),
                        fake.user_name(),
                        fake.company(),
                        r_id[0],
                    ),
                )

            cursor.execute(
                """            
                        UPDATE alcs.user 
                        SET name = given_name || ' ' || family_name;"""
            )

            conn.commit()
    except Exception as err:
        conn.rollback()
        logger.exception(err)


@log_process(logger, "update_with_random_alcs_documents")
@inject_conn_pool
def _update_with_random_alcs_documents(conn=None):
    # Set Faker for generating random names
    fake = Faker()

    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT uuid FROM alcs.document")
            record_ids = cursor.fetchall()

            for r_id in record_ids:
                sql_query = """
                            UPDATE alcs.document 
                            SET file_name = %s,
                                file_key = %s
                            WHERE uuid = %s;
                """
                cursor.execute(
                    sql_query,
                    (
                        fake.file_name(extension="pdf"),
                        fake.uuid4(),
                        r_id[0],
                    ),
                )

            conn.commit()
    except Exception as err:
        conn.rollback()
        logger.exception(err)


@log_process(logger, "update_with_random_alcs_local_government")
@inject_conn_pool
def _update_with_random_alcs_local_government(conn=None):
    fake_latin = Faker("la")

    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT uuid FROM alcs.local_government")
            record_ids = cursor.fetchall()

            for r_id in record_ids:
                sql_query = """
                            UPDATE alcs.local_government 
                            SET emails = '{}'::text[]
                            WHERE uuid = %s;
                """
                cursor.execute(sql_query, (r_id[0],))

            conn.commit()
    except Exception as err:
        conn.rollback()
        logger.exception(err)


@log_process(logger, "update_with_random_alcs_local_government")
@inject_conn_pool
def _update_with_random_alcs_message(conn=None):
    fake = Faker()

    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT uuid FROM alcs.message")
            record_ids = cursor.fetchall()

            for r_id in record_ids:
                sql_query = f"""
                            UPDATE alcs.message 
                            SET {get_update_column_query("title")}
                            WHERE uuid = %s;
                """
                cursor.execute(
                    sql_query,
                    (
                        fake.catch_phrase(),
                        r_id[0],
                    ),
                )

            conn.commit()
    except Exception as err:
        conn.rollback()
        logger.exception(err)
