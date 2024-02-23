from db import inject_conn_pool
from common import (
    setup_and_get_logger,
    BATCH_UPLOAD_SIZE,
)

etl_name = "init_srw_base"
logger = setup_and_get_logger(etl_name)


@inject_conn_pool
def init_srw_base(conn=None, batch_size=BATCH_UPLOAD_SIZE):
    """
    function uses a decorator pattern @inject_conn_pool to inject a database connection pool to the function.
    It fetches the total count of SRWs to import and prints it to the console.
    Then, it fetches the SRWs to insert in batches using application IDs / file_number, constructs an insert query, and processes them.
    """
    logger.info(f"Start {etl_name}")
    with conn.cursor() as cursor:
        _exclusion_table_create(cursor, conn)

        with open(
            "srw/sql/srw_base_insert_count.sql", "r", encoding="utf-8"
        ) as sql_file:
            count_query = sql_file.read()
            cursor.execute(count_query)
            count_total = cursor.fetchone()[0]
        logger.info(f"SRWs to insert: {count_total}")

        _exclusion_table_count(cursor, logger)

        failed_inserts = 0
        successful_inserts_count = 0
        last_row_id = 0

        with open("srw/sql/srw_base_insert.sql", "r", encoding="utf-8") as sql_file:
            application_sql = sql_file.read()
            while True:
                cursor.execute(
                    f"""{application_sql} 
                        AND ae.application_id > {last_row_id} AND (oa.application_class_code IN ('LOA', 'BLK', 'SCH', 'NAN')) ORDER by ae.application_id;
                    """
                )

                rows = cursor.fetchmany(batch_size)
                if not rows:
                    break
                try:
                    rows_to_be_inserted_count = len(rows)

                    insert_query = _compile_insert_query(rows_to_be_inserted_count)
                    cursor.execute(insert_query, rows)
                    conn.commit()

                    last_row_id = rows[-1][0]
                    successful_inserts_count = (
                        successful_inserts_count + rows_to_be_inserted_count
                    )

                    logger.debug(
                        f"retrieved/inserted items count: {rows_to_be_inserted_count}; total successfully inserted/updated rows so far {successful_inserts_count}; last inserted application_id: {last_row_id}"
                    )
                except Exception as err:
                    logger.exception(err)
                    conn.rollback()
                    failed_inserts = count_total - successful_inserts_count
                    last_row_id = last_row_id + 1

    logger.info(f"Total amount of successful inserts: {successful_inserts_count}")
    logger.info(f"Total failed inserts: {failed_inserts}")

    if failed_inserts == 0:
        with conn.cursor() as cursor:
            cursor.execute(_drop_etl_temp_table())
            logger.info("etl temp table removed")

    else:
        logger.error("Table not deleted, inserts failed")


@inject_conn_pool
def clean_initial_srw(conn=None):
    logger.info("Start SRW cleaning")
    with conn.cursor() as cursor:
        cursor.execute(
            "DELETE FROM alcs.notification a WHERE a.audit_created_by = 'oats_etl' and a.audit_updated_by is NULL"
        )
        logger.info(f"Deleted items count = {cursor.rowcount}")
        cursor.execute("DROP TABLE IF EXISTS oats.alcs_etl_srw_exclude")
        cursor.execute("DROP TABLE IF EXISTS oats.alcs_etl_srw_duplicate")
        logger.info(f"Temporary tables dropped")

    conn.commit()


def _compile_insert_query(number_of_rows_to_insert):
    """
    function takes the number of rows to insert and generates an SQL insert statement with upserts using the ON CONFLICT clause
    """

    applications_to_insert = ",".join(["%s"] * number_of_rows_to_insert)
    return f"""
        WITH cte AS (
            SELECT file_number, type_code, applicant, region_code, local_government_uuid::UUID, audit_created_by, summary, staff_comment_observations,
            ROW_NUMBER() OVER (PARTITION BY file_number, type_code, applicant, region_code, audit_created_by, summary, staff_comment_observations  ORDER BY local_government_uuid) AS rn
            FROM (VALUES{applications_to_insert}) AS t(file_number, type_code, applicant, region_code, local_government_uuid, audit_created_by, summary, staff_comment_observations)
        )
        INSERT INTO alcs.notification (file_number, type_code, 
                                      applicant, region_code, local_government_uuid, audit_created_by, summary, staff_observations)
        SELECT file_number, type_code, applicant, region_code, local_government_uuid, audit_created_by, summary, staff_comment_observations FROM cte WHERE rn = 1
        ON CONFLICT (file_number) DO UPDATE SET
            type_code = EXCLUDED.type_code,
            applicant = COALESCE((CASE WHEN EXCLUDED.applicant = 'Unknown' THEN alcs.notification.applicant ELSE EXCLUDED.applicant END), EXCLUDED.applicant),
            region_code = COALESCE(EXCLUDED.region_code, alcs.notification.region_code),
            local_government_uuid = COALESCE(EXCLUDED.local_government_uuid, alcs.notification.local_government_uuid),
            audit_created_by = EXCLUDED.audit_created_by,
            summary = EXCLUDED.summary,
            staff_observations = EXCLUDED.staff_observations
    """


def _drop_etl_temp_table():
    return f"""
        DROP TABLE IF EXISTS oats.alcs_etl_application_duplicate;
    """


def _exclusion_table_create(cursor, conn):
    with open("srw/sql/srw_populate_exclude.sql", "r", encoding="utf-8") as sql_file:
        create_tables = sql_file.read()
        cursor.execute(create_tables)
    conn.commit()


def _exclusion_table_count(cursor, logger):
    with open("srw/sql/srw_exclude_count.sql", "r", encoding="utf-8") as sql_file:
        count_exclude = sql_file.read()
        cursor.execute(count_exclude)
        count_total_exclude = cursor.fetchone()[0]
    logger.info(f"Oats applications with excluded components: {count_total_exclude}")
    logger.debug("Component ids stored in oats.alcs_etl_srw_exclude")
