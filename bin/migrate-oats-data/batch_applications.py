from db import inject_conn_pool
def application_etl_temp_table():
    """
    function creates a temporary table to be used by .sql files called later in script
    """
    return f"""
        DROP TABLE IF EXISTS oats.application_etl;

        CREATE TABLE oats.application_etl (
            id SERIAL PRIMARY KEY,
            application_id int,
            card_uuid UUID NOT NULL DEFAULT gen_random_uuid(),
            duplicated bool DEFAULT false
        )
    """

def application_exclude():
    """
    function creates table to contain duplicate type code app ids
    """
    return f"""
        DROP TABLE IF EXISTS oats.oats2alcs_etl_exclude;

        CREATE TABLE oats.oats2alcs_etl_exclude (
            application_id int
        )
    """

def application_etl_insert():
    """
    function inserts data into prevoisly created table and decipers duplication of uuids
    application_id is copied from oats.oats_alr_applications.alr_application_id
    """
    return f"""
        INSERT INTO
            oats.application_etl (application_id, duplicated)
        SELECT
            DISTINCT oa.alr_application_id AS application_id,
            CASE
                WHEN a.uuid IS NOT NULL THEN TRUE
                ELSE false
            END AS duplicated
        FROM
            oats.oats_alr_applications AS oa
            LEFT JOIN alcs.application AS a ON oa.alr_application_id :: text = a.file_number
    """

def application_exclude_insert():
    """
    Inserts values from application-exclude into table
    """
    return f"""
        INSERT INTO 
            oats.oats2alcs_etl_exclude (application_id)
        WITH application_type_lookup AS (
            SELECT
                oaac.alr_application_id AS application_id,
                oaac.alr_change_code AS code
        

            FROM
                oats.oats_alr_appl_components AS oaac
                )
       
        SELECT 
            atl.application_id
        FROM application_type_lookup atl
        GROUP BY atl.application_id 
        HAVING count(application_id) > 1

            """

def compile_application_insert_query(number_of_rows_to_insert):
    """
    function takes the number of rows to insert and generates an SQL insert statement with upserts using the ON CONFLICT clause
    """

    applications_to_insert = ",".join(["%s"] * number_of_rows_to_insert)
    return f"""
        INSERT INTO alcs.application (file_number, type_code, 
                                      applicant, region_code, local_government_uuid, audit_created_by)

        VALUES{applications_to_insert}
        ON CONFLICT (file_number) DO UPDATE SET
            file_number = EXCLUDED.file_number,
            type_code = EXCLUDED.type_code,
            applicant = EXCLUDED.applicant,
            region_code = EXCLUDED.region_code,
            local_government_uuid = EXCLUDED.local_government_uuid,
            audit_created_by = EXCLUDED.audit_created_by
    """
# ON CONFLICT needs confirmation of what value is kept
def drop_etl_temp_table():
    """
    remove the table
    """
    return f"""
    DROP TABLE IF EXISTS oats.application_etl;
    """


@inject_conn_pool
def process_applications(conn=None, batch_size=10000):
    """
    function uses a decorator pattern @inject_conn_pool to inject a database connection pool to the function. It fetches the total count of non duplicate applications and prints it to the console. Then, it fetches the applications to insert in batches using application IDs / file_number, constructs an insert query, and processes them.
    """
    with conn.cursor() as cursor:
        cursor.execute(application_etl_temp_table())
        cursor.execute(application_etl_insert())
        cursor.execute(application_exclude())
        cursor.execute(application_exclude_insert())
        conn.commit()
        with open(
            "sql/insert_batch_application_count.sql", "r", encoding="utf-8"
        ) as sql_file:
            count_query = sql_file.read()
            cursor.execute(count_query)
            count_total = cursor.fetchone()[0]
        print("- Applications to insert: ", count_total)
        with open(
            "sql/application_exclude_count.sql", "r", encoding="utf-8"
        ) as sql_file:
            count_exclude = sql_file.read()
            cursor.execute(count_exclude)
            count_total_exclude = cursor.fetchone()[0]
        print("- Applications to exclude: ", count_total_exclude)

        print("-Inserting ", count_total - count_total_exclude, " applications" )

        failed_inserts = 0
        successful_inserts_count = 0
        last_application_id = 0
        

        with open("sql/insert-batch-application.sql", "r", encoding="utf-8") as sql_file:
            application_sql = sql_file.read()
            while True:
                cursor.execute(
                    f"{application_sql} AND ae.application_id > {last_application_id} ORDER by ae.application_id;"
                )
                
                rows = cursor.fetchmany(batch_size)
                if not rows:
                    break
                try: 
                    applications_to_be_inserted_count = len(rows)

                    insert_query = compile_application_insert_query(
                        applications_to_be_inserted_count
                    ) 
                    cursor.execute(insert_query, rows)
                    conn.commit()
 
                    last_application_id = rows[-1][0]
                    successful_inserts_count = (
                        successful_inserts_count + applications_to_be_inserted_count
                    )

                    print(
                        f"retrieved/inserted items count: {applications_to_be_inserted_count}; total successfully inserted/updated applications so far {successful_inserts_count}; last inserted applidation_id: {last_application_id}"

                    )
                except Exception as e:
                    conn.rollback()
                    print("Error", e)
                    failed_inserts  = count_total - successful_inserts_count
                    last_application_id = last_application_id +1
                    break

    print("Total amount of successful inserts:", successful_inserts_count)
    print("Total failed inserts:", failed_inserts)
    print("Number of multiple type-code applications not inserted", count_total_exclude)
    if failed_inserts == 0:
        with conn.cursor() as cursor:
            cursor.execute(drop_etl_temp_table())
            print("etl temp table removed")

    else:
        print("Table not deleted, inserts failed")
        #keep only the failed rows


@inject_conn_pool
def clean_applications(conn=None):
    print("Start applications cleaning")
    with conn.cursor() as cursor:
        cursor.execute(
            "DELETE FROM alcs.application a WHERE a.audit_created_by = 'oats_etl'"
        )
        print(f"Deleted items count = {cursor.rowcount}")
        cursor.execute(
            "DROP TABLE IF EXISTS oats.oats2alcs_etl_exclude"
        )
        cursor.execute(
            "DROP TABLE IF EXISTS oats.application_etl"
        )
        print(f"Tempory tables dropped")


        

        