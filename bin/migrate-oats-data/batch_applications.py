from db import inject_conn_pool
def application_etl_temp_table():
    return f"""
        DROP TABLE IF EXISTS application_etl;

        CREATE TEMPORARY TABLE application_etl (
            id SERIAL PRIMARY KEY,
            application_id int,
            card_uuid UUID NOT NULL DEFAULT gen_random_uuid(),
            duplicated bool DEFAULT false
        )
    """

def application_etl_insert():
    return f"""
        INSERT INTO
            application_etl (application_id, duplicated)
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
# def associated_card():
#     return f"""
#         INSERT INTO alcs.card (uuid, audit_created_by)

#         SELECT
#             ae.card_uuid,
#             'oats_etl'
#         FROM
#             application_etl ae
#         WHERE
#             ae.duplicated IS false;

#     """

def compile_application_insert_query(number_of_rows_to_insert):

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

@inject_conn_pool
def process_applications(conn=None, batch_size=10000):
    """
    comments
    """
    with conn.cursor() as cursor:
        cursor.execute(application_etl_temp_table())
        cursor.execute(application_etl_insert())
        # cursor.execute(associated_card())
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
                    failed_inserts += len(rows)
                    last_application_id = last_application_id +1

    print("Total amount of successful inserts:", successful_inserts_count)
    print("Total failed inserts:", failed_inserts)

@inject_conn_pool
def clean_applications(conn=None):
    print("Start applications cleaning")
    with conn.cursor() as cursor:
        cursor.execute(
            "DELETE FROM alcs.application a WHERE a.audit_created_by = 'oats_etl'"
        )
        print(f"Deleted application items count = {cursor.rowcount}")
        cursor.execute("DELETE FROM alcs.card c WHERE c.audit_created_by = 'oats_etl'")
        print(f"Deleted cards count = {cursor.rowcount}")


        

        