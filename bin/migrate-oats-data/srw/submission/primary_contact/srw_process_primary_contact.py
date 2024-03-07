from common import BATCH_UPLOAD_SIZE, setup_and_get_logger
from db import inject_conn_pool
from psycopg2.extras import RealDictCursor, execute_batch

etl_name = "process_alcs_srw_primary_contact"
logger = setup_and_get_logger(etl_name)


@inject_conn_pool
def process_alcs_srw_primary_contact(conn=None, batch_size=BATCH_UPLOAD_SIZE):
    """
    This function is responsible for populating the primary contact details notification_submission

    Args:
    conn (psycopg2.extensions.connection): PostgreSQL database connection. Provided by the decorator.
    batch_size (int): The number of items to process at once. Defaults to BATCH_UPLOAD_SIZE.
    """

    logger.info(f"Start {etl_name}")
    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        with open(
            "srw/sql/submission/primary_contact/srw_primary_contact_count.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            count_query = sql_file.read()
            cursor.execute(count_query)
            count_total = dict(cursor.fetchone())["count"]
        logger.info(f"Total SRW data to update: {count_total}")

        failed_inserts = 0
        successful_updates_count = 0
        last_application_id = 0

        with open(
            "srw/sql/submission/primary_contact/srw_primary_contact.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            application_sql = sql_file.read()
            while True:
                cursor.execute(
                    f"""
                        {application_sql} 
                        AND alr_application_id > {last_application_id} ORDER BY alr_application_id;
                    """
                )

                rows = cursor.fetchmany(batch_size)

                if not rows:
                    break
                try:
                    records_to_be_updated_count = len(rows)

                    _update_records(conn, batch_size, cursor, rows)

                    successful_updates_count = (
                        successful_updates_count + records_to_be_updated_count
                    )
                    last_application_id = dict(rows[-1])["alr_application_id"]

                    logger.debug(
                        f"retrieved/updated items count: {records_to_be_updated_count}; total successfully updated SRWs so far {successful_updates_count}; last updated alr_application_id: {last_application_id}"
                    )
                except Exception as err:
                    # this is NOT going to be caused by actual data update failure. This code is only executed when the code error appears or connection to DB is lost
                    logger.exception(err)
                    conn.rollback()
                    failed_inserts = count_total - successful_updates_count
                    last_application_id = last_application_id + 1

    logger.info(
        f"Finished {etl_name}: total amount of successful updates {successful_updates_count}, total failed updates {failed_inserts}"
    )


def _update_records(conn, batch_size, cursor, rows):
    parsed_data_list = _prepare_oats_data(rows)

    if len(parsed_data_list) > 0:
        execute_batch(
            cursor,
            _update_query,
            parsed_data_list,
            page_size=batch_size,
        )

    conn.commit()


_update_query = """
                    UPDATE
                        alcs.notification_submission
                    SET
                        contact_email = %(contact_email)s,
                        contact_first_name = %(contact_first_name)s,
                        contact_last_name= %(contact_last_name)s,
                        contact_organization = %(contact_organization)s,
                        contact_phone = %(contact_phone)s
                    WHERE
                        alcs.notification_submission.file_number = %(file_number)s::TEXT
"""


def _prepare_oats_data(row_data_list):
    data_list = []
    for row in row_data_list:
        data_list.append(_map_fields(dict(row)))
    return data_list


def _map_fields(data):
    return {
        "contact_email": data["email_address"],
        "contact_first_name": _get_name(data),
        "contact_last_name": data["last_name"],
        "contact_organization": _get_organization_name(data),
        "contact_phone": data.get("phone_number", "cell_phone_number"),
        "file_number": data["alr_application_id"],
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

    return " ".join(
        [name for name in (first_name, middle_name) if name is not None]
    ).strip()
