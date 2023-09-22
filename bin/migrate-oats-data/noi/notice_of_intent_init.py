from db import inject_conn_pool


def noi_insert_query(number_of_rows_to_insert):
    nois_to_insert = ",".join(["%s"] * number_of_rows_to_insert)
    return f"""
        INSERT INTO alcs.notice_of_intent (file_number, 
                                      applicant, region_code, local_government_uuid, audit_created_by, type_code)

        VALUES{nois_to_insert}
        ON CONFLICT (file_number) DO UPDATE SET
            file_number = EXCLUDED.file_number,
            applicant = EXCLUDED.applicant,
            region_code = EXCLUDED.region_code,
            local_government_uuid = EXCLUDED.local_government_uuid,
            audit_created_by = EXCLUDED.audit_created_by,
            type_code = EXCLUDED.type_code
    """


@inject_conn_pool
def init_notice_of_intents(conn=None, batch_size=10000):
    with conn.cursor() as cursor:
        with open("noi/sql/insert_noi_count.sql", "r", encoding="utf-8") as sql_file:
            count_query = sql_file.read()
            cursor.execute(count_query)
            count_total = cursor.fetchone()[0]
        print("- NOIs to insert: ", count_total)

        failed_inserts = 0
        successful_inserts_count = 0
        last_application_id = 0

        with open("noi/sql/insert_noi.sql", "r", encoding="utf-8") as sql_file:
            application_sql = sql_file.read()
            while True:
                cursor.execute(
                    f"{application_sql} WHERE ng.noi_application_id > {last_application_id} ORDER by ng.noi_application_id;"
                )

                rows = cursor.fetchmany(batch_size)
                if not rows:
                    break
                try:
                    applications_to_be_inserted_count = len(rows)

                    insert_query = noi_insert_query(applications_to_be_inserted_count)
                    cursor.execute(insert_query, rows)
                    conn.commit()

                    last_application_id = rows[-1][0]
                    successful_inserts_count = (
                        successful_inserts_count + applications_to_be_inserted_count
                    )

                    print(
                        f"retrieved/inserted items count: {applications_to_be_inserted_count}; total successfully inserted/updated NOIs so far {successful_inserts_count}; last inserted noi_applidation_id: {last_application_id}"
                    )
                except Exception as e:
                    conn.rollback()
                    print("Error", e)
                    failed_inserts = count_total - successful_inserts_count
                    last_application_id = last_application_id + 1

    print("Total amount of successful inserts:", successful_inserts_count)
    print("Total failed inserts:", failed_inserts)


@inject_conn_pool
def clean_notice_of_intents(conn=None):
    print("Start NOI cleaning")
    with conn.cursor() as cursor:
        cursor.execute(
            "DELETE FROM alcs.notice_of_intent a WHERE a.audit_created_by = 'oats_etl'"
        )
        print(f"Deleted items count = {cursor.rowcount}")
