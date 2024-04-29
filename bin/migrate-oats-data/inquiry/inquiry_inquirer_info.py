from common import (
    BATCH_UPLOAD_SIZE,
    setup_and_get_logger,
    add_timezone_and_keep_date_part,
)
from db import inject_conn_pool
from psycopg2.extras import RealDictCursor, execute_batch

etl_name = "process_inquiry_inquirer_fields"
logger = setup_and_get_logger(etl_name)


@inject_conn_pool
def process_inquiry_inquirer_fields(conn=None, batch_size=BATCH_UPLOAD_SIZE):
    """
    This function is responsible for populating inquirer field in alcs.inquiry in ALCS.

    Args:
    conn (psycopg2.extensions.connection): PostgreSQL database connection. Provided by the decorator.
    batch_size (int): The number of items to process at once. Defaults to BATCH_UPLOAD_SIZE.
    """

    logger.info("Start update inquiry inquirer fields")
    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        with open(
            "inquiry/sql/inquiry_inquirer_info_count.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            count_query = sql_file.read()
            cursor.execute(count_query)
            count_total = dict(cursor.fetchone())["count"]
        logger.info(f"Total inquiry data to update: {count_total}")

        failed_inserts = 0
        successful_updates_count = 0
        last_issue_id = 0

        with open(
            "inquiry/sql/inquiry_inquirer_info.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            query = sql_file.read()
            while True:
                cursor.execute(
                    f"""
                        {query} 
                        WHERE oi.issue_id > {last_issue_id}
                        ORDER BY oi.issue_id;
                    """
                )

                rows = cursor.fetchmany(batch_size)

                if not rows:
                    break
                try:
                    updated_data = _update_base_fields(conn, batch_size, cursor, rows)

                    successful_updates_count = successful_updates_count + len(
                        updated_data
                    )
                    last_issue_id = dict(updated_data[-1])["issue_id"]

                    logger.debug(
                        f"Retrieved/updated items count: {len(updated_data)}; total successfully updated Inquiry so far {successful_updates_count}; last updated issue_id: {last_issue_id}"
                    )
                except Exception as err:
                    # this is NOT going to be caused by actual data update failure. This code is only executed when the code error appears or connection to DB is lost
                    logger.exception(err)
                    conn.rollback()
                    failed_inserts = count_total - successful_updates_count
                    last_issue_id = last_issue_id + 1

    logger.info(
        f"Finished {etl_name}: total amount of successful updates {successful_updates_count}, total failed updates {failed_inserts}"
    )


def _update_base_fields(conn, batch_size, cursor, rows):
    parsed_data_list = _prepare_oats_data(rows)

    execute_batch(
        cursor,
        _rx_items_query,
        parsed_data_list,
        page_size=batch_size,
    )

    conn.commit()
    return parsed_data_list


_rx_items_query = """
                    UPDATE alcs.inquiry 
                    SET inquirer_first_name = %(inquirer_first_name)s,
                        inquirer_last_name = %(inquirer_last_name)s,
                        inquirer_phone = %(inquirer_phone)s,
                        inquirer_email = %(inquirer_email)s,
                        inquirer_organization = %(inquirer_organization)s
                    WHERE alcs.inquiry.file_number = %(issue_id)s::text
"""


def _prepare_oats_data(row_data_list):
    mapped_data_list = []
    for row in row_data_list:
        mapped_data_list.append(
            {
                "issue_id": row["issue_id"],
                "inquirer_first_name": _get_first_name(row),
                "inquirer_last_name": row["last_name"],
                "inquirer_phone": row.get("phone_number", "cell_phone_number"),
                "inquirer_email": row["email_address"],
                "inquirer_organization": _get_organization_name(row),
            }
        )

    return mapped_data_list


def _get_first_name(row):
    first_name = row.get("first_name", None)
    middle_name = row.get("middle_name", None)

    return " ".join(
        [name for name in (first_name, middle_name) if name is not None]
    ).strip()


def _get_organization_name(row):
    organization_name = (row.get("organization_name") or "").strip()
    alias_name = (row.get("alias_name") or "").strip()

    if not organization_name and not alias_name:
        return None

    return f"{organization_name} {alias_name}".strip()
