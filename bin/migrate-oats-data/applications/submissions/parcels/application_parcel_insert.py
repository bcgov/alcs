from common import (
    setup_and_get_logger,
    BATCH_UPLOAD_SIZE,
    OATS_ETL_USER,
    add_timezone_and_keep_date_part,
    OatsToAlcsOwnershipType,
)
from db import inject_conn_pool
from psycopg2.extras import RealDictCursor

etl_name = "init_application_parcels"
logger = setup_and_get_logger(etl_name)


@inject_conn_pool
def init_application_parcels(conn=None, batch_size=BATCH_UPLOAD_SIZE):
    logger.info(f"Start {etl_name}")

    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        with open(
            "applications/submissions/sql/parcels/application_parcels_insert_count.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            count_query = sql_file.read()
            cursor.execute(count_query)
            count_total = dict(cursor.fetchone())["count"]
        logger.info(f"Total Applications Parcels to insert: {count_total}")

        failed_inserts = 0
        successful_inserts_count = 0
        last_subject_property_id = 0

        with open(
            "applications/submissions/sql/parcels/application_parcels_insert_count.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            application_sql = sql_file.read()
            while True:
                cursor.execute(
                    f"{application_sql} WHERE osp.subject_property_id > {last_subject_property_id} ORDER BY osp.subject_property_id;"
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

                    last_subject_property_id = dict(rows[-1])["subject_property_id"]

                    logger.debug(
                        f"inserted items count: {records_to_be_inserted_count}; total successfully inserted application parcels so far {successful_inserts_count}; last inserted subject_property_id: {last_subject_property_id}"
                    )
                except Exception as err:
                    logger.exception(err)
                    conn.rollback()
                    failed_inserts = count_total - successful_inserts_count
                    last_subject_property_id = last_subject_property_id + 1

    logger.info(
        f"Finished {etl_name}: total amount of successful inserts {successful_inserts_count}, total failed inserts {failed_inserts}"
    )


def _insert_records(conn, cursor, rows):
    number_of_rows_to_insert = len(rows)

    if number_of_rows_to_insert > 0:
        insert_query = _compile_application_insert_query(number_of_rows_to_insert)
        rows_to_insert = _prepare_data_to_insert(rows)
        cursor.execute(insert_query, rows_to_insert)
        conn.commit()


def _prepare_data_to_insert(rows):
    row_without_last_element = []
    for row in rows:
        mapped_row = _map_data(row)
        row_without_last_element.append(tuple(mapped_row.values()))

    return row_without_last_element


def _map_data(row):
    return {
        "application_submission_uuid": row["application_submission_uuid"],
        "audit_created_by": OATS_ETL_USER,
        "is_confirmed_by_applicant": True,
        "alr_area": row["alr_area"],
        "civic_address": row["civic_address"],
        "is_farm": row["farm_land_ind"],
        "legal_description": row["legal_description"],
        "map_area_hectares": row["area_size"],
        "ownership_type_code": _map_ownership_type_code(
            row["property_owner_type_code"]
        ),
        "pid": row["pid"],
        "pin": row["pin"],
        "purchased_date": _map_purchased_date(row["purchase_date"]),
        "oats_subject_property_id": row["subject_property_id"],
    }


def _map_ownership_type_code(ownership_type_code):
    if ownership_type_code == OatsToAlcsOwnershipType.FEE.name:
        return OatsToAlcsOwnershipType.FEE.value
    if ownership_type_code == OatsToAlcsOwnershipType.CROWN.name:
        return OatsToAlcsOwnershipType.CROWN.value
    if ownership_type_code == OatsToAlcsOwnershipType.FIRST.name:
        return OatsToAlcsOwnershipType.FIRST.value


def _map_purchased_date(purchased_date):
    date = None
    if purchased_date:
        date = add_timezone_and_keep_date_part(purchased_date)
    return date


def _compile_application_insert_query(number_of_rows_to_insert):
    parcels_to_insert = ",".join(["%s"] * number_of_rows_to_insert)
    return f"""
                    INSERT INTO alcs.application_parcel 
                    (
                        application_submission_uuid, 
                        audit_created_by, 
                        is_confirmed_by_applicant,
                        alr_area,
                        civic_address,
                        is_farm,
                        legal_description,
                        map_area_hectares,
                        ownership_type_code,
                        pid,
                        pin,
                        purchased_date,
                        oats_subject_property_id
                    )
                    VALUES{parcels_to_insert}
                    ON CONFLICT DO NOTHING
                """


@inject_conn_pool
def clean_parcels(conn=None):
    logger.info("Start application parcel cleaning")
    with conn.cursor() as cursor:
        cursor.execute(
            "DELETE FROM alcs.application_parcel appp WHERE appp.audit_created_by = 'oats_etl'"
        )
        logger.info(f"Deleted items count = {cursor.rowcount}")
    conn.commit()
    logger.info("Done application parcel cleaning")
