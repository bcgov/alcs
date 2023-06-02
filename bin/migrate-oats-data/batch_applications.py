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

def appl_code_lut():
    """
    Create temporary table to match codes from OATS to ALCS
    """
    return f"""
        DROP TABLE IF EXISTS oats.appl_code_lut;

        CREATE TABLE oats.appl_code_lut (
            oats_code VARCHAR,
            alcs_code VARCHAR
        )
    """
def insert_appl_code_lut():
    """
    Insert LUT values
    """
    return f"""

        INSERT INTO 
            oats.appl_code_lut (oats_code, alcs_code)

        VALUES ('TUR','TURP'),
            ('INC','INCL'),
            ('EXC','EXCL'),
            ('SDV','SUBD'),
            ('NFU','NFUP'),
            ('SCH','PFRS'),
            ('EXT','ROSO'),
            ('FILL','POFO'),
            ('SRW','NARU'),
            ('CSC','NARU'),
            ('NAR','NARU')

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
    DROP TABLE oats.application_etl;
    """


def drop_appl_code_temp_table():
    """
    remove the table
    """
    return f"""
    DROP TABLE oats.appl_code_lut;
    """

@inject_conn_pool
def process_applications(conn=None, batch_size=10000):
    """
    function uses a decorator pattern @inject_conn_pool to inject a database connection pool to the function. It fetches the total count of non duplicate applications and prints it to the console. Then, it fetches the applications to insert in batches using application IDs / file_number, constructs an insert query, and processes them.
    """
    with conn.cursor() as cursor:
        cursor.execute(application_etl_temp_table())
        cursor.execute(application_etl_insert())
        cursor.execute(appl_code_lut())
        print("inserting LUT")
        cursor.execute(insert_appl_code_lut())
        conn.commit()
        with open(
            "sql/insert_batch_application_count.sql", "r", encoding="utf-8"
        ) as sql_file:
            count_query = sql_file.read()
            cursor.execute(count_query)
            count_total = cursor.fetchone()[0]
        print("- Applications to insert: ", count_total)

        failed_inserts = 0
        successful_inserts_count = 0
        last_application_id = 0
        

        with open("sql/insert-batch-application.sql", "r", encoding="utf-8") as sql_file:
            application_sql = sql_file.read()
            while True:
                cursor.execute(
                    f"{application_sql} WHERE ae.application_id > {last_application_id} ORDER by ae.application_id"
                )
                
                rows = cursor.fetchmany(batch_size)
                if not rows:
                    break
                try: 
                    applications_to_be_inserted_count = len(rows)

                    insert_query = compile_application_insert_query(
                        applications_to_be_inserted_count
                    )
                    print(insert_query)
                    print(rows) 
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
    if failed_inserts == 0:
        with conn.cursor() as cursor:
            cursor.execute(drop_etl_temp_table())
            print("etl temp table removed")
            cursor.execute(drop_appl_code_temp_table())
            print("code lut removed")

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


        

        