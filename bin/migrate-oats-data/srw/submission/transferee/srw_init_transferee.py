from common import (
    setup_and_get_logger,
    BATCH_UPLOAD_SIZE,
    OATS_ETL_USER,
    to_alcs_format,
    get_now_with_offset,
    ALCSOwnershipType,
    ALCSOwnerType,
)
from db import inject_conn_pool
from psycopg2.extras import RealDictCursor

etl_name = "process_srw_parcel_transferee"
logger = setup_and_get_logger(etl_name)


@inject_conn_pool
def init_srw_parcel_transferee(conn=None, batch_size=BATCH_UPLOAD_SIZE):
    logger.info(f"Start {etl_name}")
    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        with open(
            "srw/sql/submission/transferee/srw_transferee_count.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            count_query = sql_file.read()
            cursor.execute(count_query)
            count_total = dict(cursor.fetchone())["count"]
        logger.info(f"Total Notification Transferee data to insert: {count_total}")

        failed_inserts = 0
        successful_insert_count = 0
        last_application_id = 0

        with open(
            "srw/sql/submission/transferee/srw_transferee.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            query = sql_file.read()
            while True:
                cursor.execute(
                    f"""
                        {query} 
                        AND oaap.alr_application_id > {last_application_id} ORDER BY oaap.alr_application_id;
                    """
                )

                rows = cursor.fetchmany(batch_size)

                if not rows:
                    break
                try:
                    records_to_be_inserted_count = len(rows)

                    _insert_records(conn, cursor, rows, successful_insert_count)

                    successful_insert_count = (
                        successful_insert_count + records_to_be_inserted_count
                    )

                    last_application_id = dict(rows[-1])["alr_application_id"]

                    logger.debug(
                        f"retrieved/updated items count: {records_to_be_inserted_count}; total successfully inserted Notification Transferees so far {successful_insert_count}; last updated {last_application_id}"
                    )
                except Exception as err:
                    logger.exception(err)
                    conn.rollback()
                    failed_inserts = count_total - successful_insert_count
                    last_application_id = last_application_id + 1

    logger.info(
        f"Finished {etl_name}: total amount of successful inserts {successful_insert_count}, total failed inserts {failed_inserts}"
    )


def _insert_records(conn, cursor, rows, insert_index):
    number_of_rows_to_insert = len(rows)

    if number_of_rows_to_insert > 0:
        insert_query = _compile_insert_query(number_of_rows_to_insert)
        rows_to_insert = _prepare_data_to_insert(rows, insert_index)
        cursor.execute(insert_query, rows_to_insert)
        print("commit records")
        conn.commit()


def _compile_insert_query(number_of_rows_to_insert):
    records_to_insert = ",".join(["%s"] * number_of_rows_to_insert)
    return f"""
                        INSERT INTO alcs.notification_transferee(
                            audit_created_by,
                            audit_created_at,
                            email,
                            first_name, 
                            last_name,
                            notification_submission_uuid, 
                            organization_name, 
                            phone_number, 
                            type_code,
                            oats_alr_application_party_id
                        )
                        VALUES{records_to_insert}
                        ON CONFLICT DO NOTHING;
    """


def _prepare_data_to_insert(rows, insert_index):
    row_without_last_element = []
    for row in rows:
        mapped_row = _map_data(row, insert_index)
        row_without_last_element.append(tuple(mapped_row.values()))
        insert_index += 1

    return row_without_last_element


def _map_data(row, insert_index):
    return {
        "audit_created_by": OATS_ETL_USER,
        "audit_created_at": to_alcs_format(get_now_with_offset(insert_index)),
        "email": row["email_address"],
        "first_name": _get_name(row),
        "last_name": row["last_name"],
        "notification_submission_uuid": row["notification_submission_uuid"],
        "organization_name": _get_organization_name(row),
        "phone_number": row.get("phone_number", "cell_phone_number"),
        "type_code": _map_owner_type(row),
        "oats_alr_application_party_id": row["alr_application_party_id"],
    }


def _get_organization_name(row):
    organization_name = (row.get("organization_name") or "").strip()
    alias_name = (row.get("alias_name") or "").strip()

    if not organization_name and not alias_name:
        return row["title"]

    return f"{organization_name} {alias_name}".strip()


def _get_name(row):
    first_name = row.get("first_name", None)
    middle_name = row.get("middle_name", None)

    result = " ".join(
        [name for name in (first_name, middle_name) if name is not None]
    ).strip()

    return None if result == "" else result


def _map_owner_type(data):
    if data["organization_id"]:
        return ALCSOwnerType.ORGZ.value
    if data["person_id"]:
        return ALCSOwnerType.INDV.value


@inject_conn_pool
def clean_transferees(conn=None):
    logger.info("Start notification transferee cleaning")
    with conn.cursor() as cursor:
        cursor.execute(
            f"DELETE FROM alcs.notification_transferee WHERE audit_created_by = '{OATS_ETL_USER}' AND audit_updated_by IS NULL"
        )
        logger.info(f"Deleted items count = {cursor.rowcount}")
    conn.commit()
    logger.info("Done notification transferee cleaning")
