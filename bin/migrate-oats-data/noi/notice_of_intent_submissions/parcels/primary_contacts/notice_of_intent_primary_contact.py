from common import (
    setup_and_get_logger,
    BATCH_UPLOAD_SIZE,
    OATS_ETL_USER,
    ALCSOwnerType,
)
from db import inject_conn_pool
from psycopg2.extras import RealDictCursor

etl_name = "init_notice_of_intent_primary_contacts"
logger = setup_and_get_logger(etl_name)


@inject_conn_pool
def init_notice_of_intent_primary_contacts(conn=None, batch_size=BATCH_UPLOAD_SIZE):
    logger.info(f"Start {etl_name}")
    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        with open(
            "noi/sql/notice_of_intent_submission/primary_contact/notice_of_intent_primary_contact_count.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            count_query = sql_file.read()
            cursor.execute(count_query)
            count_total = dict(cursor.fetchone())["count"]
        logger.info(f"Total Notice of Intents data to insert: {count_total}")

        failed_inserts = 0
        successful_updates_count = 0
        last_file_number = 0

        with open(
            "noi/sql/notice_of_intent_submission/primary_contact/notice_of_intent_primary_contact.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            application_sql = sql_file.read()
            while True:
                cursor.execute(
                    f"{application_sql} AND alr_application_id > {last_file_number} ORDER BY alr_application_id;"
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

                    last_file_number = dict(rows[-1])["alr_application_id"]

                    logger.debug(
                        f"retrieved/updated items count: {records_to_be_inserted_count}; total successfully insert notice of intents owners so far {successful_updates_count}; last updated {last_file_number}"
                    )
                except Exception as err:
                    logger.exception(err)
                    conn.rollback()
                    failed_inserts = count_total - successful_updates_count
                    last_file_number += 1

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
                        INSERT INTO alcs.notice_of_intent_owner(
                            first_name, 
                            last_name,
                            organization_name, 
                            notice_of_intent_submission_uuid, 
                            email, 
                            phone_number, 
                            type_code, 
                            oats_application_party_id,
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
        "notice_of_intent_submission_uuid": row["notice_of_intent_submission_uuid"],
        "email": row["email_address"],
        "phone_number": row.get("phone_number", "cell_phone_number"),
        "type_code": ALCSOwnerType.AGEN.value,
        "oats_application_party_id": row["alr_application_party_id"],
        "audit_created_by": OATS_ETL_USER,
    }


def _get_name(row):
    first_name = row.get("first_name", "")
    middle_name = row.get("middle_name", "")
    return f"{first_name} {middle_name}".strip()


@inject_conn_pool
def clean_primary_contacts(conn=None):
    logger.info("Start notice of intent primary contact cleaning")
    with conn.cursor() as cursor:
        cursor.execute(
            f"UPDATE alcs.notice_of_intent_submission SET primary_contact_owner_uuid = NULL WHERE audit_created_by = '{OATS_ETL_USER}'"
        )
        logger.info(f"Unassigned items count = {cursor.rowcount}")
    conn.commit()
    logger.info("Done notice of intent primary contact cleaning")
