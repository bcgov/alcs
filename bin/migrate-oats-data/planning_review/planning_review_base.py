from db import inject_conn_pool
from common import (
    setup_and_get_logger,
    BATCH_UPLOAD_SIZE,
)

etl_name = "init_planning_review_base"
logger = setup_and_get_logger(etl_name)


@inject_conn_pool
def init_planning_review_base(conn=None, batch_size=BATCH_UPLOAD_SIZE):
    """
    function uses a decorator pattern @inject_conn_pool to inject a database connection pool to the function.
    It fetches the total count of Planning Reviews to import and prints it to the console.
    Then, it fetches the PLanning reviews to insert in batches using planning review IDs / file_number, constructs an insert query, and processes them.
    """
    logger.info(f"Start {etl_name}")
    with conn.cursor() as cursor:

        with open(
            "planning_review/sql/planning_review_base_insert_count.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            count_query = sql_file.read()
            cursor.execute(count_query)
            count_total = cursor.fetchone()[0]
        logger.info(f"Planning Reviews to insert: {count_total}")

        failed_inserts_count = 0
        successful_inserts_count = 0
        last_row_id = 0

        with open(
            "planning_review/sql/planning_review_base_insert.sql", "r", encoding="utf-8"
        ) as sql_file:
            application_sql = sql_file.read()
            while True:
                cursor.execute(
                    f"""{application_sql} 
                        WHERE oa.planning_review_id > {last_row_id} ORDER by oa.planning_review_id;
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
                    failed_inserts_count = count_total - successful_inserts_count
                    last_row_id = int(last_row_id) + 1

    logger.info(f"Total amount of successful inserts: {successful_inserts_count}")
    logger.info(f"Total failed inserts: {failed_inserts_count}")


@inject_conn_pool
def clean_initial_planning_review(conn=None):
    logger.info("Start Planning Review cleaning")
    with conn.cursor() as cursor:
        cursor.execute(
            "DELETE FROM alcs.planning_review a WHERE a.audit_created_by = 'oats_etl' and a.audit_updated_by is NULL"
        )
        logger.info(f"Deleted items count = {cursor.rowcount}")

    conn.commit()


def _compile_insert_query(number_of_rows_to_insert):
    """
    function takes the number of rows to insert and generates an SQL insert statement with upserts using the ON CONFLICT clause
    """

    applications_to_insert = ",".join(["%s"] * number_of_rows_to_insert)

    return f"""
        INSERT INTO alcs.planning_review (file_number, region_code, type_code, local_government_uuid, document_name, audit_created_by)
        VALUES{applications_to_insert}
        ON CONFLICT (file_number) DO UPDATE SET
            region_code = COALESCE(EXCLUDED.region_code, alcs.planning_review.region_code),
            type_code = EXCLUDED.type_code,
            local_government_uuid = COALESCE(EXCLUDED.local_government_uuid, alcs.planning_review.local_government_uuid),
            document_name = EXCLUDED.document_name,
            audit_created_by = EXCLUDED.audit_created_by

    """
