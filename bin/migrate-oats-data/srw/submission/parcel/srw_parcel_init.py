from common import (
    BATCH_UPLOAD_SIZE,
    setup_and_get_logger,
    OATS_ETL_USER,
    OatsToAlcsOwnershipType,
    to_alcs_format,
    get_now_with_offset,
)
from db import inject_conn_pool
from psycopg2.extras import RealDictCursor

etl_name = "init_srw_parcels"
logger = setup_and_get_logger(etl_name)


@inject_conn_pool
def init_srw_parcels(conn=None, batch_size=BATCH_UPLOAD_SIZE):
    logger.info(f"Start {etl_name}")

    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        with open(
            "srw/sql/submission/parcel/srw_parcels_insert_count.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            count_query = sql_file.read()
            cursor.execute(count_query)
            count_total = dict(cursor.fetchone())["count"]
        logger.info(f"Total Notification Parcels to insert: {count_total}")

        failed_inserts = 0
        successful_inserts_count = 0
        last_subject_property_id = 0

        with open(
            "srw/sql/submission/parcel/srw_parcels_insert.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            application_sql = sql_file.read()
            while True:
                cursor.execute(
                    f"""
                        {application_sql}
                        WHERE osp.subject_property_id > {last_subject_property_id} ORDER BY osp.subject_property_id;
                    """
                )

                rows = cursor.fetchmany(batch_size)

                if not rows:
                    break
                try:
                    records_to_be_inserted_count = len(rows)

                    _insert_records(conn, cursor, rows, successful_inserts_count)

                    successful_inserts_count = (
                        successful_inserts_count + records_to_be_inserted_count
                    )

                    last_subject_property_id = dict(rows[-1])["subject_property_id"]

                    logger.debug(
                        f"inserted items count: {records_to_be_inserted_count}; total successfully inserted Notification Parcels so far {successful_inserts_count}; last inserted subject_property_id: {last_subject_property_id}"
                    )
                except Exception as err:
                    logger.exception(err)
                    conn.rollback()
                    failed_inserts = count_total - successful_inserts_count
                    last_subject_property_id = last_subject_property_id + 1

    logger.info(
        f"Finished {etl_name}: total amount of successful inserts {successful_inserts_count}, total failed inserts {failed_inserts}"
    )


def _insert_records(conn, cursor, rows, insert_index):
    number_of_rows_to_insert = len(rows)

    if number_of_rows_to_insert > 0:
        insert_query = _compile_parcel_insert_query(number_of_rows_to_insert)
        rows_to_insert = _prepare_data_to_insert(rows, insert_index)
        cursor.execute(insert_query, rows_to_insert)
        conn.commit()


def _prepare_data_to_insert(rows, insert_index):
    row_without_last_element = []
    for row in rows:
        mapped_row = _map_data(row, insert_index)
        row_without_last_element.append(tuple(mapped_row.values()))
        insert_index += 1

    return row_without_last_element


def _map_data(row, insert_index):
    return {
        "notification_submission_uuid": row["notification_submission_uuid"],
        "audit_created_by": OATS_ETL_USER,
        "audit_created_at": to_alcs_format(get_now_with_offset(insert_index)),
        "civic_address": row["civic_address"],
        "legal_description": row["legal_description"],
        "map_area_hectares": row["area_size"],
        "ownership_type_code": _map_ownership_type_code(row),
        "pid": str(row["pid"]).zfill(9) if row["pid"] is not None else None,
        "pin": row["pin"],
        "oats_subject_property_id": row["subject_property_id"],
        "oats_property_id": row["property_id"],
    }


def _map_ownership_type_code(data):
    return (
        OatsToAlcsOwnershipType.CROWN.value
        if data.get("pin") or not data.get("pid")
        else OatsToAlcsOwnershipType.FEE.value
    )


def _compile_parcel_insert_query(number_of_rows_to_insert):
    parcels_to_insert = ",".join(["%s"] * number_of_rows_to_insert)
    return f"""
                    INSERT INTO alcs.notification_parcel 
                    (
                        notification_submission_uuid, 
                        audit_created_by, 
                        audit_created_at,
                        civic_address,
                        legal_description,
                        map_area_hectares,
                        ownership_type_code,
                        pid,
                        pin,
                        oats_subject_property_id,
                        oats_property_id
                    )
                    VALUES{parcels_to_insert}
                    ON CONFLICT DO NOTHING
                """


@inject_conn_pool
def clean_parcels(conn=None):
    logger.info("Start notification parcel cleaning")
    with conn.cursor() as cursor:
        cursor.execute(
            "DELETE FROM alcs.notification_parcel nop WHERE nop.audit_created_by = 'oats_etl' AND nop.audit_updated_by IS NULL"
        )
        logger.info(f"Deleted items count = {cursor.rowcount}")
    conn.commit()
    logger.info("Done notification parcel cleaning")
