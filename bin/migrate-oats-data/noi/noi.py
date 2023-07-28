from db import inject_conn_pool

def noi_insert_query(number_of_rows_to_insert):
    nois_to_insert = ",".join(["%s"] * number_of_rows_to_insert)
    # need to update for noi's
    return f"""
        INSERT INTO alcs.notice_of_intent (file_number, summary, 
                                      applicant, region_code, local_government_uuid, audit_created_by)

        VALUES{nois_to_insert}
        ON CONFLICT (file_number) DO UPDATE SET
            file_number = EXCLUDED.file_number,
            type_code = EXCLUDED.type_code,
            summary = EXCLUDED.summary,
            region_code = EXCLUDED.region_code,
            local_government_uuid = EXCLUDED.local_government_uuid,
            audit_created_by = EXCLUDED.audit_created_by
    """

@inject_conn_pool
def process_nois(conn=None, batch_size=10000):
    with conn.cursor() as cursor:

        with open(
            "sql/insert_noi_count.sql", "r", encoding="utf-8"
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
                    f"{application_sql} WHERE ae.application_id > {last_application_id} ORDER by ae.application_id;"
                )
                
                rows = cursor.fetchmany(batch_size)
                if not rows:
                    break
                try: 
                    applications_to_be_inserted_count = len(rows)

                    insert_query = noi_insert_query(
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


    print("Total amount of successful inserts:", successful_inserts_count)
    print("Total failed inserts:", failed_inserts)        

def applicant_lookup():
    query = """
                    SELECT DISTINCT
                        oaap.alr_application_id AS application_id,
                        string_agg (DISTINCT oo.organization_name, ', ') FILTER (
                            WHERE
                                oo.organization_name IS NOT NULL
                        ) AS orgs,
                        string_agg (
                            DISTINCT concat (op.first_name || ' ' || op.last_name),
                            ', '
                        ) FILTER (
                            WHERE
                                op.last_name IS NOT NULL
                                OR op.first_name IS NOT NULL
                        ) AS persons
                    FROM
                        oats.oats_alr_application_parties oaap
                        LEFT JOIN oats.oats_person_organizations opo ON oaap.person_organization_id = opo.person_organization_id
                        LEFT JOIN oats.oats_persons op ON op.person_id = opo.person_id
                        LEFT JOIN oats.oats_organizations oo ON opo.organization_id = oo.organization_id
                    WHERE
                        oaap.alr_appl_role_code = 'APPL'
                    GROUP BY
                        oaap.alr_application_id
                """
    return query

def oats_gov():
    query = """
                    SELECT
                        oaap.alr_application_id AS application_id,
                        oo.organization_name AS oats_gov_name
                    FROM
                        oats.oats_alr_application_parties oaap
                        JOIN oats.oats_person_organizations opo ON oaap.person_organization_id = opo.person_organization_id
                        JOIN oats.oats_organizations oo ON opo.organization_id = oo.organization_id
                    WHERE
                        oo.organization_type_cd IN ('MUNI','FN','RD')
                """
    return query

def alcs_gov():
    query = """
                    SELECT
                        oats_gov.application_id AS application_id,
                        alg.uuid AS gov_uuid
                    FROM
                        oats_gov
                        JOIN alcs.application_local_government alg on oats_gov.oats_gov_name = alg."name"
                """