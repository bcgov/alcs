from common import (
    setup_and_get_logger,
    BATCH_UPLOAD_SIZE,
    OATS_ETL_USER,
    ALCSOwnershipType,
    ALCSOwnerType,
)
from db import inject_conn_pool
from psycopg2.extras import RealDictCursor

etl_name = "process_application_parcel_owners"
logger = setup_and_get_logger(etl_name)


@inject_conn_pool
def init_application_parcel_owners(conn=None, batch_size=BATCH_UPLOAD_SIZE):
    logger.info(f"Start {etl_name}")
    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        with open(
            "applications/submissions/sql/parcels/owners/application_owner_count.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            count_query = sql_file.read()
            cursor.execute(count_query)
            count_total = dict(cursor.fetchone())["count"]
        logger.info(f"Total applications data to insert: {count_total}")

        failed_inserts = 0
        successful_updates_count = 0
        last_subject_property = 0
        last_person_organization_id = 0

        with open(
            "applications/submissions/sql/parcels/owners/application_owner.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            application_sql = sql_file.read()
            while True:
                cursor.execute(
                    f"{application_sql} WHERE (osp.subject_property_id = {last_subject_property} AND opo.person_organization_id > {last_person_organization_id}) OR osp.subject_property_id > {last_subject_property}  ORDER BY osp.subject_property_id, opo.person_organization_id;"
                )

                rows = cursor.fetchmany(batch_size)

                if not rows:
                    break
                try:
                    records_to_be_inserted_count = len(rows)

                    _insert_records(conn, cursor, rows)

                    successful_updates_count = (
                        successful_updates_count + records_to_be_inserted_count
                    )

                    last_record = dict(rows[-1])
                    last_subject_property = last_record["subject_property_id"]
                    last_person_organization_id = last_record["person_organization_id"]

                    logger.debug(
                        f"retrieved/updated items count: {records_to_be_inserted_count}; total successfully insert applications owners so far {successful_updates_count}; last updated {last_subject_property} {last_person_organization_id}"
                    )
                except Exception as err:
                    logger.exception(err)
                    conn.rollback()
                    failed_inserts = count_total - successful_updates_count
                    last_person_organization_id = last_person_organization_id + 1

    logger.info(
        f"Finished {etl_name}: total amount of successful inserts {successful_updates_count}, total failed inserts {failed_inserts}"
    )


def _insert_records(conn, cursor, rows):
    number_of_rows_to_insert = len(rows)

    if number_of_rows_to_insert > 0:
        insert_query = _compile_owner_insert_query(number_of_rows_to_insert)
        rows_to_insert = _prepare_data_to_insert(rows)
        cursor.execute(insert_query, rows_to_insert)
        conn.commit()


def _compile_owner_insert_query(number_of_rows_to_insert):
    owners_to_insert = ",".join(["%s"] * number_of_rows_to_insert)
    return f"""
                        INSERT INTO alcs.application_owner(
                            first_name, 
                            last_name,
                            organization_name, 
                            application_submission_uuid, 
                            email, 
                            phone_number, 
                            type_code, 
                            oats_person_organization_id,
                            audit_created_by
                        )
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
        "first_name": _get_name(row),
        "last_name": row["last_name"],
        "organization_name": row["organization_name"],
        "application_submission_uuid": row["application_submission_uuid"],
        "email": row["email_address"],
        "phone_number": row.get("phone_number", "cell_phone_number"),
        "type_code": _map_owner_type(row),
        "oats_person_organization_id": row["person_organization_id"],
        "audit_created_by": OATS_ETL_USER,
    }


def _get_name(row):
    first_name = row.get("first_name", "")
    middle_name = row.get("middle_name", "")
    return f"{first_name} {middle_name}".strip()


def _map_owner_type(owner_record):
    # Default to fee simple for missing owner type
    if owner_record["ownership_type_code"] == None:
        return ALCSOwnerType.INDV.value

    if owner_record["ownership_type_code"] == ALCSOwnershipType.FeeSimple.value:
        if owner_record["person_id"] and not owner_record["organization_id"]:
            return ALCSOwnerType.INDV.value
        elif owner_record["organization_id"]:
            return ALCSOwnerType.ORGZ.value
    elif owner_record["ownership_type_code"] == ALCSOwnershipType.Crown.value:
        return ALCSOwnerType.CRWN.value


@inject_conn_pool
def clean_owners(conn=None):
    logger.info("Start application owner cleaning")
    with conn.cursor() as cursor:
        cursor.execute(
            f"DELETE FROM alcs.application_owner appo WHERE appo.audit_created_by = '{OATS_ETL_USER}'"
        )
        logger.info(f"Deleted items count = {cursor.rowcount}")
    conn.commit()
    logger.info("Done application owner cleaning")
