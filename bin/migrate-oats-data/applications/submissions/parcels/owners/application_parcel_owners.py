from common import (
    setup_and_get_logger,
    BATCH_UPLOAD_SIZE,
    OATS_ETL_USER,
)
from db import inject_conn_pool
from psycopg2.extras import RealDictCursor

etl_name = "link_application_owners_to_parcels"
logger = setup_and_get_logger(etl_name)


@inject_conn_pool
def link_application_owners_to_parcels(conn=None, batch_size=BATCH_UPLOAD_SIZE):
    logger.info(f"Start {etl_name}")
    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        with open(
            "applications/submissions/sql/parcels/owners/application_parcel_owner_linking_count.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            count_query = sql_file.read()
            cursor.execute(count_query)
            count_total = dict(cursor.fetchone())["count"]
        logger.info(f"Total applications data to insert: {count_total}")

        failed_inserts = 0
        successful_inserts_count = 0
        last_parcel_uuid = "00000000-0000-0000-0000-000000000000"
        last_owner_uuid = "00000000-0000-0000-0000-000000000000"

        with open(
            "applications/submissions/sql/parcels/owners/application_parcel_owner_linking.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            application_sql = sql_file.read()
            while True:
                cursor.execute(
                    f"{application_sql} AND ((appp.\"uuid\" = '{last_parcel_uuid}' AND appo.\"uuid\" > '{last_owner_uuid}') OR appp.\"uuid\" > '{last_parcel_uuid}') ORDER BY parcel_uuid, owner_uuid;"
                )

                rows = cursor.fetchmany(batch_size)

                if not rows:
                    break
                try:
                    records_to_be_inserted_count = len(rows)

                    logger.info(records_to_be_inserted_count)
                    _insert_records(conn, cursor, rows)

                    successful_inserts_count = (
                        successful_inserts_count + records_to_be_inserted_count
                    )

                    last_record = dict(rows[-1])
                    last_parcel_uuid = last_record["parcel_uuid"]
                    last_owner_uuid = last_record["owner_uuid"]

                    logger.debug(
                        f"retrieved/updated items count: {records_to_be_inserted_count}; total successfully inserted applications parcel_owners so far {successful_inserts_count}; last inserted {last_parcel_uuid} {last_owner_uuid}"
                    )
                except Exception as err:
                    logger.exception(err)
                    conn.rollback()
                    failed_inserts = count_total - successful_inserts_count
                    last_owner_uuid = last_owner_uuid + 1

    logger.info(
        f"Finished {etl_name}: total amount of successful inserts {successful_inserts_count}, total failed inserts {failed_inserts}"
    )


def _insert_records(conn, cursor, rows):
    number_of_rows_to_insert = len(rows)

    if number_of_rows_to_insert > 0:
        insert_query = _compile_parcel_owner_insert_query(number_of_rows_to_insert)
        rows_to_insert = _prepare_data_to_insert(rows)
        cursor.execute(insert_query, rows_to_insert)
        conn.commit()


def _compile_parcel_owner_insert_query(number_of_rows_to_insert):
    owners_to_insert = ",".join(["%s"] * number_of_rows_to_insert)
    return f"""
                        INSERT INTO alcs.application_parcel_owners_application_owner(application_parcel_uuid, application_owner_uuid)
                        VALUES{owners_to_insert}
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
        "application_parcel_uuid": row["parcel_uuid"],
        "application_owner_uuid": row["owner_uuid"],
    }


@inject_conn_pool
def clean_parcel_owners(conn=None):
    logger.info("Start application parcel to owner cleaning")
    with conn.cursor() as cursor:
        cursor.execute(
            f"""
                DELETE FROM alcs.application_parcel_owners_application_owner AS apppo
                USING alcs.application_parcel  appp 
                WHERE appp."uuid" = apppo.application_parcel_uuid AND appp.audit_created_by = '{OATS_ETL_USER}';"""
        )
        conn.commit()
        deleted_items_total = cursor.rowcount
        cursor.execute(
            f"""
                DELETE FROM alcs.application_parcel_owners_application_owner AS apppo
                USING alcs.application_owner  appo 
                WHERE appo."uuid" = apppo.application_parcel_uuid AND appo.audit_created_by = '{OATS_ETL_USER}';"""
        )
        conn.commit()
        deleted_items_total += cursor.rowcount
        logger.info(f"Deleted items count = {deleted_items_total}")

    logger.info("Done application owner cleaning")
