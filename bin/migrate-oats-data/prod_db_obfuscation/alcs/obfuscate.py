from common import setup_and_get_logger
from db import inject_conn_pool
from ..lorem_ipsum import lorem_ipsum_string
from faker import Faker
import functools

logger = setup_and_get_logger("prod_data_obfuscation")


def process_alcs_data():
    logger.info("Start alcs obfuscation.")
    _update_description_columns()
    _delete_data_from_tables()
    _update_body_columns()
    _update_comment_columns()
    _update_with_random_alcs_users()
    _update_with_random_alcs_applications()
    _update_with_random_alcs_covenant()
    _update_with_random_alcs_documents()
    _update_with_random_alcs_notice_of_intent()
    _update_with_random_alcs_notice_of_intent_decision()


def log_process(proc_name):
    def decorator_log_process(func):
        @functools.wraps(func)
        def wrapper_log_process(*args, **kwargs):
            logger.info(f"Start '{proc_name}'")
            result = func(*args, **kwargs)
            logger.info(f"Finished '{proc_name}'")
            return result

        return wrapper_log_process

    return decorator_log_process


@log_process("update_description_columns")
@inject_conn_pool
def _update_description_columns(conn=None):
    create_proc_sql = f"""
    {_lorem_ipsum_function_query}

    CREATE OR REPLACE FUNCTION update_description_schema() RETURNS VOID AS $$
    DECLARE
        r RECORD;
    BEGIN
        FOR r IN (SELECT * FROM information_schema.columns WHERE column_name LIKE '%description%' and (data_type='text' or data_type like 'character varying') AND table_schema = 'alcs' AND table_name NOT LIKE '%code' AND table_name NOT LIKE '%type') LOOP
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


@log_process("delete_data_from_tables")
@inject_conn_pool
def _delete_data_from_tables(conn=None):
    # List of tables from which you want to delete data
    table_names = ["alcs.comment_mention", "alcs.email_status", "alcs.notification"]

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


@log_process("update_body_columns")
@inject_conn_pool
def _update_body_columns(conn=None):
    create_proc_sql = f"""
    {_lorem_ipsum_function_query}

    CREATE OR REPLACE FUNCTION update_body_columns() RETURNS VOID AS $$
    DECLARE
        r RECORD;
    BEGIN
        FOR r IN (SELECT * FROM information_schema.columns WHERE column_name = 'body' and (data_type='text' or data_type like 'character varying') AND table_schema = 'alcs' AND table_name NOT LIKE '%code' AND table_name NOT LIKE '%type') LOOP
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


@log_process("update_comment_columns")
@inject_conn_pool
def _update_comment_columns(conn=None):
    create_proc_sql = f"""
    {_lorem_ipsum_function_query}

    CREATE OR REPLACE FUNCTION update_comment_columns() RETURNS VOID AS $$
    DECLARE
        r RECORD;
    BEGIN
        FOR r IN (SELECT * FROM information_schema.columns WHERE column_name = '%comment%' and (data_type='text' or data_type like 'character varying') AND table_schema = 'alcs') LOOP
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


@log_process("update_with_random_names_oats_persons")
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
                                settings = NULL,
                                client_roles = '{LUP}'
                            WHERE uuid = %s;
                            
                            UPDATE alcs.user 
                            SET name = given_name || ' ' || family_name;
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
                        r_id[0],
                    ),
                )

            conn.commit()
    except Exception as err:
        conn.rollback()
        logger.exception(err)


@log_process("update_with_random_alcs_applications")
@inject_conn_pool
def _update_with_random_alcs_applications(conn=None):
    # Set Faker for generating random names
    fake = Faker()
    fake_latin = Faker("la")

    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT uuid FROM alcs.application")
            record_ids = cursor.fetchall()

            for r_id in record_ids:
                sql_query = """
                            UPDATE alcs.application 
                            SET summary = CASE WHEN summary IS NOT NULL THEN %s ELSE summary END, 
                                ag_cap_consultant = CASE WHEN ag_cap_consultant IS NOT NULL THEN %s ELSE ag_cap_consultant END, 
                                staff_observations = CASE WHEN staff_observations IS NOT NULL THEN %s ELSE staff_observations END,
                                applicant = CASE WHEN applicant IS NOT NULL THEN %s ELSE applicant END
                            WHERE uuid = %s;
                """
                cursor.execute(
                    sql_query,
                    (
                        fake_latin.sentence(nb_words=10),
                        fake.name(),
                        fake_latin.sentence(nb_words=5),
                        fake.name(),
                        r_id[0],
                    ),
                )

            conn.commit()
    except Exception as err:
        conn.rollback()
        logger.exception(err)


@log_process("update_with_random_alcs_covenant")
@inject_conn_pool
def _update_with_random_alcs_covenant(conn=None):
    # Set Faker for generating random names
    fake = Faker()

    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT uuid FROM alcs.covenant")
            record_ids = cursor.fetchall()

            for r_id in record_ids:
                sql_query = """
                            UPDATE alcs.covenant 
                            SET applicant = CASE WHEN applicant IS NOT NULL THEN %s ELSE applicant END
                            WHERE uuid = %s;
                """
                cursor.execute(
                    sql_query,
                    (
                        fake.name(),
                        r_id[0],
                    ),
                )

            conn.commit()
    except Exception as err:
        conn.rollback()
        logger.exception(err)


@log_process("update_with_random_alcs_documents")
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


@log_process("update_with_random_alcs_notice_of_intent")
@inject_conn_pool
def _update_with_random_alcs_notice_of_intent(conn=None):
    # Set Faker for generating random names
    fake = Faker()

    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT uuid FROM alcs.notice_of_intent")
            record_ids = cursor.fetchall()

            for r_id in record_ids:
                sql_query = """
                            UPDATE alcs.notice_of_intent 
                            SET applicant = CASE WHEN applicant IS NOT NULL THEN %s ELSE applicant END
                            WHERE uuid = %s;
                """
                cursor.execute(
                    sql_query,
                    (
                        fake.name(),
                        r_id[0],
                    ),
                )

            conn.commit()
    except Exception as err:
        conn.rollback()
        logger.exception(err)


@log_process("update_with_random_alcs_notice_of_intent_decision")
@inject_conn_pool
def _update_with_random_alcs_notice_of_intent_decision(conn=None):
    # Set Faker for generating random names
    fake = Faker()

    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT uuid FROM alcs.notice_of_intent_decision")
            record_ids = cursor.fetchall()

            for r_id in record_ids:
                sql_query = """
                            UPDATE alcs.notice_of_intent_decision 
                            SET decision_maker_name = CASE WHEN decision_maker_name IS NOT NULL THEN %s ELSE decision_maker_name END
                            WHERE uuid = %s;
                """
                cursor.execute(
                    sql_query,
                    (
                        fake.name(),
                        r_id[0],
                    ),
                )

            conn.commit()
    except Exception as err:
        conn.rollback()
        logger.exception(err)


_lorem_ipsum_function_query = f"""
CREATE OR REPLACE FUNCTION random_lorem_ipsum() RETURNS text AS $$
    DECLARE
        lorem_ipsum_str text = '{lorem_ipsum_string}';-- put your full string here

        words text[];
        i INT;
        output text = '';
        
    BEGIN

        words := string_to_array(lorem_ipsum_str, ' ');

        FOR i IN 1..50 LOOP
            output := output || ' ' || words[1 + floor(random() * array_length(words, 1))];
        END LOOP;

        RETURN output;
        
END;
$$ LANGUAGE plpgsql;"""
