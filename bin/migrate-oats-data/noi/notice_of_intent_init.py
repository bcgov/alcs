from common import (
    OATS_ETL_USER,
    setup_and_get_logger,
    exclusion_table_create,
    exclusion_table_count,
)
from db import inject_conn_pool

etl_name = "init_notice_of_intents"
logger = setup_and_get_logger(etl_name)


@inject_conn_pool
def init_notice_of_intents(conn=None, batch_size=10000):
    logger.info(f"Start {etl_name}")
    with conn.cursor() as cursor:
        exclusion_table_create(cursor, conn)
        exclusion_table_count(cursor, logger)
        with open("noi/sql/insert_noi_count.sql", "r", encoding="utf-8") as sql_file:
            count_query = sql_file.read()
            cursor.execute(count_query)
            count_total = cursor.fetchone()[0]
        logger.info(f"NOIs to insert: {count_total}")

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

                    insert_query = _noi_insert_query(applications_to_be_inserted_count)
                    cursor.execute(insert_query, rows)
                    conn.commit()

                    last_application_id = rows[-1][0]
                    successful_inserts_count = (
                        successful_inserts_count + applications_to_be_inserted_count
                    )

                    logger.debug(
                        f"retrieved/inserted items count: {applications_to_be_inserted_count}; total successfully inserted/updated NOIs so far {successful_inserts_count}; last inserted noi_id: {last_application_id}"
                    )
                except Exception as err:
                    logger.exception()
                    conn.rollback()
                    failed_inserts = count_total - successful_inserts_count
                    last_application_id = last_application_id + 1

    logger.info(
        f"Finished {etl_name}: total amount of successful inserts: {successful_inserts_count}, total failed inserts {failed_inserts}"
    )


@inject_conn_pool
def clean_notice_of_intents(conn=None):
    logger.info("Start NOI cleaning")
    with conn.cursor() as cursor:
        cursor.execute(
            f"DELETE FROM alcs.notice_of_intent WHERE audit_created_by = '{OATS_ETL_USER}' AND audit_updated_by = null"
        )
        logger.info(f"Deleted items count = {cursor.rowcount}")

    conn.commit()


def _noi_insert_query(number_of_rows_to_insert):
    nois_to_insert = ",".join(["%s"] * number_of_rows_to_insert)
    return f"""
        INSERT INTO alcs.notice_of_intent (file_number, 
                                      applicant, region_code, local_government_uuid, audit_created_by, type_code)

        VALUES{nois_to_insert}
        ON CONFLICT (file_number) DO UPDATE SET
            file_number = EXCLUDED.file_number,
            applicant = COALESCE((CASE WHEN EXCLUDED.applicant = 'Unknown' THEN alcs.notice_of_intent.applicant ELSE EXCLUDED.applicant END), EXCLUDED.applicant),
            region_code = COALESCE(EXCLUDED.region_code, alcs.notice_of_intent.region_code),
            local_government_uuid = COALESCE(EXCLUDED.local_government_uuid, alcs.notice_of_intent.local_government_uuid),
            audit_created_by = EXCLUDED.audit_created_by,
            type_code = EXCLUDED.type_code
    """
