from common import (
    setup_and_get_logger,
    BATCH_UPLOAD_SIZE,
    OATS_ETL_POST_LAUNCH_USER,
)
from db import inject_conn_pool
from psycopg2.extras import RealDictCursor

etl_name = "import_application_boundary_amendments"
logger = setup_and_get_logger(etl_name)


@inject_conn_pool
def insert_application_boundary_amendments(conn=None, batch_size=BATCH_UPLOAD_SIZE):
    logger.info(f"Start {etl_name}")
    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        with open(
            "applications/post_launch/sql/application_components/boundary_amendments/application_boundary_amendments_count.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            count_query = sql_file.read()
            cursor.execute(count_query)
            count_total = dict(cursor.fetchone())["count"]
        logger.info(f"Total applications data to insert: {count_total}")

        failed_inserts_count = 0
        successful_inserts_count = 0
        last_component_id = 0

        with open(
            "applications/post_launch/sql/application_components/boundary_amendments/application_boundary_amendments.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            application_sql = sql_file.read()
            while True:
                cursor.execute(
                    f"""{application_sql} 
                      AND  oaac.alr_appl_component_id > {last_component_id} ORDER BY  oaac.alr_appl_component_id;"""
                )

                rows = cursor.fetchmany(batch_size)

                if not rows:
                    break
                try:
                    records_to_be_inserted_count = len(rows)

                    _insert_records(conn, cursor, rows)

                    successful_inserts_count = (
                        successful_inserts_count + records_to_be_inserted_count
                    )

                    last_record = dict(rows[-1])
                    last_component_id = last_record["alr_appl_component_id"]

                    logger.debug(
                        f"retrieved/updated items count: {records_to_be_inserted_count}; total successfully insert applications boundary amendments so far {successful_inserts_count}; last updated {last_component_id}"
                    )
                except Exception as err:
                    logger.exception(err)
                    conn.rollback()
                    failed_inserts_count = count_total - successful_inserts_count
                    last_component_id = last_component_id + 1

    logger.info(
        f"Finished {etl_name}: total amount of successful inserts {successful_inserts_count}, total failed inserts {failed_inserts_count}"
    )


def _insert_records(conn, cursor, rows):
    number_of_rows_to_insert = len(rows)

    if number_of_rows_to_insert > 0:
        insert_query = _compile_insert_query(number_of_rows_to_insert)
        rows_to_insert = _prepare_data_to_insert(rows)
        cursor.execute(insert_query, rows_to_insert)
        conn.commit()


def _compile_insert_query(number_of_rows_to_insert):
    amendments_to_insert = ",".join(["%s"] * number_of_rows_to_insert)
    return f"""
                        INSERT INTO alcs.application_boundary_amendment(
                            file_number, 
                            type,
                            area,
                            year,
                            period,
                            oats_component_id,
                            audit_created_by
                        )
                        VALUES{amendments_to_insert}
                        ON CONFLICT DO NOTHING;
    """


def _prepare_data_to_insert(rows):
    row_without_last_element = []
    for row in rows:
        mapped_row = _map_data(row)
        row_without_last_element.append(tuple(mapped_row.values()))

    return row_without_last_element


def _map_data(row):
    return {
        "file_number": row["file_number"],
        "type": row["application_decision_component_type_code"],
        "area": row["alr_area"],
        "year": row["amendment_year"],
        "period": row["amendment_period"],
        "oats_component_id": row["alr_appl_component_id"],
        "audit_created_by": OATS_ETL_POST_LAUNCH_USER,
    }


@inject_conn_pool
def clean_boundary_amendments(conn=None):
    logger.info("Start application boundary amendment cleaning")
    with conn.cursor() as cursor:
        cursor.execute(
            f"DELETE FROM alcs.application_boundary_amendment aba WHERE aba.audit_created_by = '{OATS_ETL_POST_LAUNCH_USER}'"
        )
        logger.info(f"Deleted items count = {cursor.rowcount}")
    conn.commit()
    logger.info("Done application boundary amendment cleaning")
