from db import inject_conn_pool
from common import (
    setup_and_get_logger,
    exclusion_table_create,
    exclusion_table_count,
    BATCH_UPLOAD_SIZE
)

etl_name = "process_applications"
logger = setup_and_get_logger(etl_name)


@inject_conn_pool
def process_applications(conn=None, batch_size=BATCH_UPLOAD_SIZE):
    """
    function uses a decorator pattern @inject_conn_pool to inject a database connection pool to the function. It fetches the total count of non duplicate applications and prints it to the console. Then, it fetches the applications to insert in batches using application IDs / file_number, constructs an insert query, and processes them.
    """
    logger.info(f"Start {etl_name}")
    with conn.cursor() as cursor:
        exclusion_table_create(cursor, conn)

        with open(
            "applications/sql/insert_batch_application_count.sql", "r", encoding="utf-8"
        ) as sql_file:
            count_query = sql_file.read()
            cursor.execute(count_query)
            count_total = cursor.fetchone()[0]
        logger.info(f"Applications to insert: {count_total}")

        exclusion_table_count(cursor, logger)

        failed_inserts = 0
        successful_inserts_count = 0
        last_application_id = 0

        with open(
            "applications/sql/insert-batch-application.sql", "r", encoding="utf-8"
        ) as sql_file:
            application_sql = sql_file.read()
            while True:
                cursor.execute(
                    f"{application_sql} WHERE ae.application_id > {last_application_id} AND (oa.application_class_code = 'LOA' OR oa.application_class_code = 'BLK') ORDER by ae.application_id;"
                )

                rows = cursor.fetchmany(batch_size)
                if not rows:
                    break
                try:
                    applications_to_be_inserted_count = len(rows)

                    insert_query = _compile_application_insert_query(
                        applications_to_be_inserted_count
                    )
                    cursor.execute(insert_query, rows)
                    conn.commit()

                    last_application_id = rows[-1][0]
                    successful_inserts_count = (
                        successful_inserts_count + applications_to_be_inserted_count
                    )

                    logger.debug(
                        f"retrieved/inserted items count: {applications_to_be_inserted_count}; total successfully inserted/updated applications so far {successful_inserts_count}; last inserted applidation_id: {last_application_id}"
                    )
                except Exception as err:
                    logger.exception(err)
                    conn.rollback()
                    failed_inserts = count_total - successful_inserts_count
                    last_application_id = last_application_id + 1

    logger.info(f"Total amount of successful inserts: {successful_inserts_count}")
    logger.info(f"Total failed inserts: {failed_inserts}")

    if failed_inserts == 0:
        with conn.cursor() as cursor:
            cursor.execute(_drop_etl_temp_table())
            logger.info("etl temp table removed")

    else:
        logger.error("Table not deleted, inserts failed")
        # keep only the failed rows


@inject_conn_pool
def clean_applications(conn=None):
    logger.info("Start applications cleaning")
    with conn.cursor() as cursor:
        logger.debug("Start applications cleaning")
        cursor.execute("DROP INDEX IF EXISTS alcs.idx_audit_created_by")
        cursor.execute(
            "CREATE INDEX idx_audit_created_by ON alcs.application(audit_created_by)"
        )
        cursor.execute(
            "DELETE FROM alcs.application a WHERE a.audit_created_by = 'oats_etl'"
        )
        logger.info(f"Deleted items count = {cursor.rowcount}")
        cursor.execute("DROP INDEX IF EXISTS alcs.idx_audit_created_by")
        cursor.execute("DROP TABLE IF EXISTS oats.alcs_etl_application_exclude")
        cursor.execute("DROP TABLE IF EXISTS oats.alcs_etl_application_duplicate")
        logger.info(f"Temporary tables dropped")

    conn.commit()


def _compile_application_insert_query(number_of_rows_to_insert):
    """
    function takes the number of rows to insert and generates an SQL insert statement with upserts using the ON CONFLICT clause
    """

    applications_to_insert = ",".join(["%s"] * number_of_rows_to_insert)
    return f"""
        INSERT INTO alcs.application (file_number, type_code, 
                                      applicant, region_code, local_government_uuid, audit_created_by, source)

        VALUES{applications_to_insert}
        ON CONFLICT (file_number) DO UPDATE SET
            file_number = EXCLUDED.file_number,
            type_code = EXCLUDED.type_code,
            applicant = COALESCE((CASE WHEN EXCLUDED.applicant = 'Unknown' THEN alcs.application.applicant ELSE EXCLUDED.applicant END), EXCLUDED.applicant),
            region_code = COALESCE(EXCLUDED.region_code, alcs.application.region_code),
            local_government_uuid = COALESCE(EXCLUDED.local_government_uuid, alcs.application.local_government_uuid),
            audit_created_by = EXCLUDED.audit_created_by
    """


# ON CONFLICT needs confirmation of what value is kept
def _drop_etl_temp_table():
    """
    remove the table
    """
    return f"""

    DROP TABLE IF EXISTS oats.alcs_etl_application_duplicate;
    """
