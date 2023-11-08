from common import setup_and_get_logger, BATCH_UPLOAD_SIZE, OATS_ETL_USER
from db import inject_conn_pool
from psycopg2.extras import RealDictCursor

etl_name = "process_notice_of_intent_parcel_owners"
logger = setup_and_get_logger(etl_name)


@inject_conn_pool
def process_notice_of_intent_parcel_owners(conn=None, batch_size=BATCH_UPLOAD_SIZE):
    logger.info(f"Start {etl_name}")
    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        with open(
            "noi/sql/notice_of_intent_submission/parcels/owners/notice_of_intent_owner_count.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            count_query = sql_file.read()
            cursor.execute(count_query)
            count_total = dict(cursor.fetchone())["count"]
        logger.info(f"Total Notice of Intents data to insert: {count_total}")

        failed_inserts = 0
        successful_updates_count = 0
        last_subject_property = 0
        last_person_organization_id = 0

        with open(
            "noi/sql/notice_of_intent_submission/parcels/owners/notice_of_intent_owner.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            application_sql = sql_file.read()
            while True:
                cursor.execute(
                    f"{application_sql} WHERE osp.subject_property_id > {last_subject_property} AND opo.person_organization_id > {last_person_organization_id}  ORDER BY osp.subject_property_id, opo.person_organization_id;"
                )

                rows = cursor.fetchmany(batch_size)

                if not rows:
                    break
                try:
                    records_to_be_updated_count = len(rows)

                    _insert_records(conn, cursor, rows)

                    successful_updates_count = (
                        successful_updates_count + records_to_be_updated_count
                    )
                    last_subject_property = dict(rows[-1])["subject_property_id"]
                    last_person_organization_id = dict(rows[-1])[
                        "person_organization_id"
                    ]

                    logger.debug(
                        f"retrieved/updated items count: {records_to_be_updated_count}; total successfully updated notice of intents so far {successful_updates_count}; last updated {last_subject_property} {last_person_organization_id}"
                    )
                except Exception as err:
                    logger.exception(err)
                    conn.rollback()
                    failed_inserts = count_total - successful_updates_count
                    last_person_organization_id = last_person_organization_id + 1

    logger.info(
        f"Finished {etl_name}: total amount of successful updates {successful_updates_count}, total failed updates {failed_inserts}"
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
                        INSERT INTO alcs.notice_of_intent_owner(
                            first_name, 
                            last_name,
                            organization_name, 
                            notice_of_intent_submission_uuid, 
                            email, 
                            phone_number, 
                            type_code, 
                            oats_person_organization_id,
                            audit_created_by
                        )
                        VALUES{owners_to_insert}
                        ON CONFLICT DO NOTHING
    """


def _prepare_data_to_insert(rows):
    row_without_last_element = []
    for row in rows:
        mapped_row = _map_data(row)
        row_without_last_element.append(tuple(mapped_row.values()))

    return row_without_last_element


def _map_data(row):
    return {
        "first_name": row["first_name"],
        "last_name": row["last_name"],
        "organization_name": row["organization_name"],
        "notice_of_intent_submission_uuid": row["notice_of_intent_submission_uuid"],
        "email": row["email_address"],
        "phone_number": row.get("phone_number", "cell_phone_number", None),
        "type_code": _map_owner_type(row),
        "oats_person_organization_id": row["person_organization_id"],
        "audit_created_by": OATS_ETL_USER,
    }


def _map_owner_type(owner_record):
    if owner_record["ownership_type_code"] == "SMPL":
        if owner_record["person_id"] and not owner_record["organization_id"]:
            return "INDV"
        elif owner_record["organization_id"]:
            return "ORGZ"
    elif owner_record["ownership_type_code"] == "CRWN":
        return "CRWN"


# _parcel_owner_insert_query = f""""
#                     INSERT INTO alcs.notice_of_intent_parcel_owners_notice_of_intent_owner(notice_of_intent_parcel_uuid, notice_of_intent_owner_uuid)
#                     VALUES{values}
#                     ON CONFLICT DO NOTHING
# """
