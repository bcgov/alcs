from common import setup_and_get_logger
from db import inject_conn_pool
from ..lorem_ipsum import lorem_ipsum_string
from faker import Faker

logger = setup_and_get_logger("prod_data_obfuscation")


def process_oats_data():
    logger.info("Start oats obfuscation.")
    update_person_identification_info()
    delete_data_from_tables()
    update_note_columns()
    update_with_random_names_oats_persons()
    update_with_random_names_oats_alcs_staff()
    update_with_random_names_oats_compliance_inspector()
    update_description_columns()
    update_desc_columns()
    update_with_random_names_oats_agri_cap_consultant()
    update_term_columns()
    update_with_random_oats_issues()
    update_with_random_oats_documents()
    update_with_random_oats_organization()
    update_with_random_oats_planning_review()
    update_comment_columns()
    update_with_random_oats_alr_application()
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
    except Exception as err:
        conn.rollback()
        logger.exception(err)

    logger.info(f"Finished '{proc_name}'")


@inject_conn_pool
def update_person_identification_info(conn=None):
    proc_name = "update_person_identification_info"
    logger.info(f"Start '{proc_name}'")

    create_proc_sql = """
        CREATE OR REPLACE FUNCTION update_info_oats_schema() RETURNS VOID AS $$
        DECLARE r RECORD;
            firstnames TEXT[] := ARRAY['John', 'Jane', 'Adam', 'Sara', 'Mike', 'Emma'];
            lastnames TEXT[] := ARRAY['Doe', 'Smith', 'Johnson', 'Brown', 'Williams', 'Miller'];
            midnames  TEXT[] := ARRAY['A', 'B', 'C', 'D','E', 'F'];
            random_index int;
        BEGIN
            FOR r IN (SELECT * FROM information_schema.columns 
                      WHERE (column_name IN ('phone_number', 'cell_phone_number', 'email', 'email_address', 'website_url', 'fax_number' , 'title')) 
                      AND table_schema = 'oats') LOOP
                CASE 
                    WHEN r.column_name = 'phone_number' THEN EXECUTE format('UPDATE oats.%s SET phone_number = ''(111) 111-1111'' WHERE phone_number IS NOT NULL', r.table_name);
                    WHEN r.column_name = 'cell_phone_number' THEN EXECUTE format('UPDATE oats.%s SET cell_phone_number = ''(222) 222-2222'' WHERE cell_phone_number IS NOT NULL', r.table_name);
                    WHEN r.column_name = 'fax_number' THEN EXECUTE format('UPDATE oats.%s SET fax_number = ''(333) 333-3333'' WHERE fax_number IS NOT NULL', r.table_name);
                    WHEN r.column_name = 'website_url' THEN EXECUTE format('UPDATE oats.%s SET website_url = ''random-web-site'' WHERE website_url IS NOT NULL', r.table_name);
                    WHEN r.column_name = 'title' THEN EXECUTE format('UPDATE oats.%s SET title = ''random-title'' WHERE title IS NOT NULL', r.table_name);
                    WHEN r.column_name LIKE '%email%' THEN EXECUTE format('UPDATE oats.%s SET %s = ''11@11'' WHERE %s IS NOT NULL', r.table_name, r.column_name, r.column_name);
                END CASE;
            END LOOP;
        END;
        $$ LANGUAGE plpgsql;
    """

    execute_proc_sql = "SELECT update_info_oats_schema();"
    drop_proc_sql = "DROP FUNCTION update_info_oats_schema();"

    try:
        with conn.cursor() as cursor:
            cursor.execute(create_proc_sql)
            cursor.execute(execute_proc_sql)
            cursor.execute(drop_proc_sql)
        conn.commit()
    except Exception as err:
        conn.rollback()
        logger.exception(err)

    logger.info(f"Finished '{proc_name}'")


@inject_conn_pool
def delete_data_from_tables(conn=None):
    proc_name = "delete_data_from_tables"
    logger.info(f"Start '{proc_name}'")

    # List of tables from which you want to delete data
    table_names = [
        "oats.oats_alr_unvalidated_app_data",
        "oats.oats_email_notifications",
        "oats.oats_email_type_codes",
        "oats.oats_email_status_codes",
        "oats.oats_financial_instruments",
        "oats.oats_financial_instrument_cds",
        "oats.oats_stop_work_order_rcpnts",
        "oats.oats_system_setting_codes",
    ]

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
        logger.info(f"Finished '{proc_name}'.")

    except Exception as err:
        logger.exception(err)


@inject_conn_pool
def update_note_columns(conn=None):
    proc_name = "update_note_columns"
    logger.info(f"Start '{proc_name}'")

    create_proc_sql = f"""
    CREATE OR REPLACE FUNCTION random_lorem_ipsum() RETURNS text AS $$
    DECLARE
        lorem_ipsum_str text = '{lorem_ipsum_string}';

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
    $$ LANGUAGE plpgsql;

    CREATE OR REPLACE FUNCTION update_note_schema() RETURNS VOID AS $$
    DECLARE
        r RECORD;
    BEGIN
        FOR r IN (SELECT * FROM information_schema.columns WHERE column_name LIKE '%text%' and (data_type='text' or data_type like 'character varying') AND table_schema = 'oats') LOOP
            EXECUTE format('UPDATE oats.%s SET %s = random_lorem_ipsum() WHERE %s IS NOT NULL', r.table_name, r.column_name, r.column_name);
        END LOOP;
    END;
    $$ LANGUAGE plpgsql;
    """

    execute_proc_sql = "SELECT update_note_schema();"

    try:
        with conn.cursor() as cursor:
            cursor.execute(create_proc_sql)
            cursor.execute(execute_proc_sql)
            conn.commit()
    except Exception as err:
        conn.rollback()
        logger.exception(err)

    logger.info(f"Finished '{proc_name}'")


@inject_conn_pool
def update_with_random_names_oats_persons(conn=None):
    # Set Faker for generating random names
    fake = Faker()

    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT person_id FROM oats.oats_persons")
            record_ids = cursor.fetchall()

            for r_id in record_ids:
                sql_query = """
                            UPDATE oats.oats_persons 
                            SET first_name = %s, last_name = %s, middle_name = %s
                            WHERE person_id = %s;
                """
                cursor.execute(
                    sql_query,
                    (fake.first_name(), fake.last_name(), fake.first_name(), r_id[0]),
                )

            conn.commit()
    except Exception as err:
        conn.rollback()
        logger.exception(err)


@inject_conn_pool
def update_with_random_names_oats_alcs_staff(conn=None):
    # Set Faker for generating random names
    fake = Faker()

    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT alc_staff_id FROM oats.oats_alc_staffs")
            record_ids = cursor.fetchall()

            for r_id in record_ids:
                sql_query = """
                            UPDATE oats.oats_alc_staffs
                            SET login = %s, first_name = %s, last_name = %s
                            WHERE alc_staff_id = %s;
                """
                cursor.execute(
                    sql_query,
                    (fake.user_name(), fake.first_name(), fake.last_name(), r_id[0]),
                )

            conn.commit()
    except Exception as err:
        conn.rollback()
        logger.exception(err)


@inject_conn_pool
def update_with_random_names_oats_compliance_inspector(conn=None):
    fake = Faker()

    try:
        with conn.cursor() as cursor:
            cursor.execute(
                "SELECT compliance_inspection_id FROM oats.oats_compliance_inspections"
            )
            record_ids = cursor.fetchall()

            for r_id in record_ids:
                sql_query = """
                            UPDATE oats.oats_compliance_inspections
                            SET inspector = %s
                            WHERE compliance_inspection_id = %s;
                """
                cursor.execute(
                    sql_query,
                    (fake.first_name(), r_id[0]),
                )

            conn.commit()
    except Exception as err:
        conn.rollback()
        logger.exception(err)


@inject_conn_pool
def update_description_columns(conn=None):
    proc_name = "update_description_columns"
    logger.info(f"Start '{proc_name}'")

    create_proc_sql = f"""
    CREATE OR REPLACE FUNCTION random_lorem_ipsum() RETURNS text AS $$
    DECLARE
        lorem_ipsum_str text = '{lorem_ipsum_string}';

        words text[];
        i INT;
        output text = '';
        
    BEGIN

        words := string_to_array(lorem_ipsum_str, ' ');

        FOR i IN 1..5 LOOP
            output := output || ' ' || words[1 + floor(random() * array_length(words, 1))];
        END LOOP;

        RETURN output;
        
    END;
    $$ LANGUAGE plpgsql;

    CREATE OR REPLACE FUNCTION update_description_schema() RETURNS VOID AS $$
    DECLARE
        r RECORD;
    BEGIN
        FOR r IN (SELECT * FROM information_schema.columns WHERE column_name LIKE '%description%' and (data_type='text' or data_type like 'character varying') AND table_schema = 'oats' AND table_name NOT LIKE '%code%' AND table_name NOT LIKE '%cdc%' AND table_name NOT LIKE '%type%') LOOP
            EXECUTE format('UPDATE oats.%s SET %s = random_lorem_ipsum() WHERE %s IS NOT NULL', r.table_name, r.column_name, r.column_name);
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

    logger.info(f"Finished '{proc_name}'")


@inject_conn_pool
def update_desc_columns(conn=None):
    proc_name = "update_desc_columns"
    logger.info(f"Start '{proc_name}'")

    create_proc_sql = f"""
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
    $$ LANGUAGE plpgsql;

    CREATE OR REPLACE FUNCTION update_desc_schema() RETURNS VOID AS $$
    DECLARE
        r RECORD;
    BEGIN
        FOR r IN (SELECT * FROM information_schema.columns WHERE column_name LIKE '%_desc' and (data_type='text' or data_type like 'character varying') AND table_schema = 'oats') LOOP
            EXECUTE format('UPDATE oats.%s SET %s = random_lorem_ipsum() WHERE %s IS NOT NULL', r.table_name, r.column_name, r.column_name);
        END LOOP;
    END;
    $$ LANGUAGE plpgsql;
    """

    execute_proc_sql = "SELECT update_desc_schema();"

    try:
        with conn.cursor() as cursor:
            cursor.execute(create_proc_sql)
            cursor.execute(execute_proc_sql)
            conn.commit()
    except Exception as err:
        conn.rollback()
        logger.exception(err)

    logger.info(f"Finished '{proc_name}'")


@inject_conn_pool
def update_with_random_names_oats_agri_cap_consultant(conn=None):
    fake = Faker()

    try:
        with conn.cursor() as cursor:
            cursor.execute(
                "SELECT alr_appl_component_id FROM oats.oats_alr_appl_components"
            )
            record_ids = cursor.fetchall()

            for r_id in record_ids:
                sql_query = """
                            UPDATE oats.oats_alr_appl_components
                            SET agri_cap_consultant = %s
                            WHERE alr_appl_component_id = %s;
                """
                cursor.execute(
                    sql_query,
                    (fake.first_name(), r_id[0]),
                )

            conn.commit()
    except Exception as err:
        conn.rollback()
        logger.exception(err)


@inject_conn_pool
def update_term_columns(conn=None):
    proc_name = "update_term_columns"
    logger.info(f"Start '{proc_name}'")

    create_proc_sql = f"""
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
    $$ LANGUAGE plpgsql;

    CREATE OR REPLACE FUNCTION update_term_schema() RETURNS VOID AS $$
    DECLARE
        r RECORD;
    BEGIN
        FOR r IN (SELECT * FROM information_schema.columns WHERE column_name LIKE '%term%' and (data_type='text' or data_type like 'character varying') AND table_schema = 'oats') LOOP
            EXECUTE format('UPDATE oats.%s SET %s = random_lorem_ipsum() WHERE %s IS NOT NULL', r.table_name, r.column_name, r.column_name);
        END LOOP;
    END;
    $$ LANGUAGE plpgsql;
    """

    execute_proc_sql = "SELECT update_term_schema();"

    try:
        with conn.cursor() as cursor:
            cursor.execute(create_proc_sql)
            cursor.execute(execute_proc_sql)
            conn.commit()
    except Exception as err:
        conn.rollback()
        logger.exception(err)

    logger.info(f"Finished '{proc_name}'")


@inject_conn_pool
def update_with_random_oats_issues(conn=None):
    fake = Faker()
    fake_latin = Faker("la")

    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT issue_id FROM oats.oats_issues")
            record_ids = cursor.fetchall()

            for r_id in record_ids:
                sql_query = """
                            UPDATE oats.oats_issues
                                    SET swo_issued_by = CASE WHEN swo_issued_by IS NOT NULL THEN %s ELSE swo_issued_by END,
                                    swo_ceo_review_result = CASE WHEN swo_ceo_review_result IS NOT NULL THEN %s ELSE swo_ceo_review_result END
                            WHERE issue_id = %s;
                """
                cursor.execute(
                    sql_query,
                    (fake.first_name(), fake_latin.sentence(nb_words=10), r_id[0]),
                )

            conn.commit()
    except Exception as err:
        conn.rollback()
        logger.exception(err)


@inject_conn_pool
def update_with_random_oats_documents(conn=None):
    fake = Faker()

    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT document_id FROM oats.oats_documents")
            record_ids = cursor.fetchall()

            for r_id in record_ids:
                sql_query = """
                            UPDATE oats.oats_documents
                                    SET file_name = %s
                            WHERE document_id = %s;
                """
                cursor.execute(
                    sql_query,
                    (fake.company(), r_id[0]),
                )

            conn.commit()
    except Exception as err:
        conn.rollback()
        logger.exception(err)


@inject_conn_pool
def update_with_random_oats_organization(conn=None):
    fake = Faker()

    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT organization_id FROM oats.oats_organizations")
            record_ids = cursor.fetchall()

            for r_id in record_ids:
                sql_query = """
                            UPDATE oats.oats_organizations
                                    SET organization_name = %s,
                                        alias_name = %s
                            WHERE organization_id = %s;
                """
                cursor.execute(
                    sql_query,
                    (fake.company(), fake.company(), r_id[0]),
                )

            conn.commit()
    except Exception as err:
        conn.rollback()
        logger.exception(err)


@inject_conn_pool
def update_with_random_oats_planning_review(conn=None):
    fake = Faker()

    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT planning_review_id FROM oats.oats_planning_reviews")
            record_ids = cursor.fetchall()

            for r_id in record_ids:
                sql_query = """
                            UPDATE oats.oats_planning_reviews
                                    SET local_gov_document_name = %s
                            WHERE planning_review_id = %s;
                """
                cursor.execute(
                    sql_query,
                    (fake.company(), r_id[0]),
                )

            conn.commit()
    except Exception as err:
        conn.rollback()
        logger.exception(err)


@inject_conn_pool
def update_comment_columns(conn=None):
    proc_name = "update_comment_columns"
    logger.info(f"Start '{proc_name}'")

    create_proc_sql = f"""
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
    $$ LANGUAGE plpgsql;

    CREATE OR REPLACE FUNCTION update_comment_columns() RETURNS VOID AS $$
    DECLARE
        r RECORD;
    BEGIN
        FOR r IN (SELECT * FROM information_schema.columns WHERE column_name LIKE '%comment%' and (data_type='text' or data_type like 'character varying') AND table_schema = 'oats') LOOP
            EXECUTE format('UPDATE oats.%s SET %s = random_lorem_ipsum() WHERE %s IS NOT NULL', r.table_name, r.column_name, r.column_name);
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

    logger.info(f"Finished '{proc_name}'")


@inject_conn_pool
def update_with_random_oats_alr_application(conn=None):
    fake = Faker()

    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT alr_application_id FROM oats.oats_alr_applications")
            record_ids = cursor.fetchall()

            for r_id in record_ids:
                sql_query = """
                            UPDATE oats.oats_alr_applications
                                    SET applicant_file_no = CASE WHEN applicant_file_no IS NOT NULL THEN %s ELSE applicant_file_no END, 
                                        ministry_notice_ref_no = CASE WHEN ministry_notice_ref_no IS NOT NULL THEN %s ELSE ministry_notice_ref_no END
                            WHERE alr_application_id = %s;
                """
                cursor.execute(
                    sql_query,
                    (
                        str(fake.random_int(min=0, max=9999)),
                        str(fake.random_int(min=0, max=9999)),
                        r_id[0],
                    ),
                )

            conn.commit()
    except Exception as err:
        conn.rollback()
        logger.exception(err)
