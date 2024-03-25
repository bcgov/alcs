from common import (
    setup_and_get_logger,
    BATCH_UPLOAD_SIZE,
    OATS_ETL_USER,
    DEFAULT_ETL_USER_UUID,
    add_timezone_and_keep_date_part,
)
from db import inject_conn_pool
from datetime import datetime
from psycopg2.extras import RealDictCursor

etl_name = "init_inquiries"
logger = setup_and_get_logger(etl_name)


@inject_conn_pool
def init_inquiries(conn=None, batch_size=BATCH_UPLOAD_SIZE):
    logger.info(f"Start {etl_name}")
    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        with open(
            "inquiry/sql/inquiry_base_insert_count.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            count_query = sql_file.read()
            cursor.execute(count_query)
            count_total = dict(cursor.fetchone())["count"]
        logger.info(f"Total inquiry data to insert: {count_total}")

        failed_inserts_count = 0
        successful_inserts_count = 0
        last_imported_id = 0

        with open(
            "inquiry/sql/inquiry_base_insert.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            query = sql_file.read()
            while True:
                cursor.execute(
                    f"""{query} 
                      AND oi.issue_id > {last_imported_id} ORDER BY oi.issue_id;"""
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
                    last_imported_id = last_record["issue_id"]

                    logger.debug(
                        f"retrieved/updated items count: {records_to_be_inserted_count}; total successfully imported inquiry so far {successful_inserts_count}; last updated {last_imported_id}"
                    )
                except Exception as err:
                    logger.exception(err)
                    conn.rollback()
                    failed_inserts_count = count_total - successful_inserts_count
                    last_imported_id = last_imported_id + 1

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
    records_to_insert = ",".join(["%s"] * number_of_rows_to_insert)
    return f"""
                INSERT INTO alcs.inquiry(
                    file_number, 
                    summary,
                    date_submitted_to_alc,
                    open,
                    local_government_uuid,
                    region_code,
                    type_code,
                    audit_created_by,
                    closed_by_uuid,
                    closed_date
                )
                VALUES{records_to_insert}
                ON CONFLICT (file_number) DO UPDATE SET
                summary = COALESCE(EXCLUDED.summary, alcs.inquiry.summary),
                date_submitted_to_alc = COALESCE(EXCLUDED.date_submitted_to_alc, alcs.inquiry.date_submitted_to_alc),
                open = COALESCE(EXCLUDED.open, alcs.inquiry.open),
                region_code = COALESCE(EXCLUDED.region_code, alcs.inquiry.region_code),
                type_code = EXCLUDED.type_code,
                local_government_uuid = COALESCE(EXCLUDED.local_government_uuid, alcs.inquiry.local_government_uuid),
                audit_created_by = EXCLUDED.audit_created_by,
                closed_by_uuid = COALESCE(EXCLUDED.closed_by_uuid, alcs.inquiry.closed_by_uuid),
                closed_date = COALESCE(EXCLUDED.closed_date, alcs.inquiry.closed_date);
    """


def _prepare_data_to_insert(rows):
    data_to_insert = []
    for row in rows:
        mapped_row = _map_data(row)
        data_to_insert.append(tuple(mapped_row.values()))

    return data_to_insert


def _map_data(row):
    date_str = "0001-01-01 00:00:00.000 -0800"

    return {
        "file_number": row["issue_id"],
        "summary": row["description"],
        "dateSubmittedToAlc": add_timezone_and_keep_date_part(row["received_date"]),
        "open": False,
        "local_government_uuid": row["gov_uuid"],
        "region_code": row["region_code"],
        "type_code": row["issue_type_code"],
        "audit_created_by": OATS_ETL_USER,
        "closed_by_uuid": DEFAULT_ETL_USER_UUID,
        "closed_date": date_str,
    }


@inject_conn_pool
def clean_inquiries(conn=None):
    logger.info("Start inquiry cleaning")
    with conn.cursor() as cursor:
        cursor.execute(
            f"DELETE FROM alcs.inquiry inq WHERE inq.audit_created_by = '{OATS_ETL_USER}' AND inq.audit_updated_by IS NULL"
        )
        logger.info(f"Deleted items count = {cursor.rowcount}")
    conn.commit()
    logger.info("Done inquiry cleaning")
