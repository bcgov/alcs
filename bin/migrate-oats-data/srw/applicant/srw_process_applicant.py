from common import (
    BATCH_UPLOAD_SIZE,
    setup_and_get_logger,
)
from db import inject_conn_pool
from psycopg2.extras import RealDictCursor, execute_batch

etl_name = "update_srw_base_applicant"
logger = setup_and_get_logger(etl_name)


@inject_conn_pool
def update_srw_base_applicant(conn=None, batch_size=BATCH_UPLOAD_SIZE):
    """
    This function is responsible for populating applicant in alcs.notification in ALCS.

    Args:
    conn (psycopg2.extensions.connection): PostgreSQL database connection. Provided by the decorator.
    batch_size (int): The number of items to process at once. Defaults to BATCH_UPLOAD_SIZE.
    """

    logger.info("Start update srw base fields")
    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        with open(
            "srw/sql/applicant/srw_applicant_count.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            count_query = sql_file.read()
            cursor.execute(count_query)
            count_total = dict(cursor.fetchone())["count"]
        logger.info(f"Total SRW data to update: {count_total}")

        failed_inserts = 0
        successful_updates_count = 0
        last_processed_id = 0

        with open(
            "srw/sql/applicant/srw_applicant.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            query = sql_file.read()
            while True:
                cursor.execute(
                    f"""
                        {query} 
                        AND oats_alr_application_party_id > {last_processed_id}
                        ORDER BY oats_alr_application_party_id;
                    """
                )

                rows = cursor.fetchmany(batch_size)

                if not rows:
                    break
                try:
                    updated_data = _update_applicant(conn, batch_size, cursor, rows)

                    successful_updates_count = successful_updates_count + len(
                        updated_data
                    )
                    last_processed_id = dict(updated_data[-1])[
                        "oats_alr_application_party_id"
                    ]

                    logger.debug(
                        f"Retrieved/updated items count: {len(updated_data)}; total successfully updated SRW so far {successful_updates_count}; last updated id: {last_processed_id}"
                    )
                except Exception as err:
                    # this is NOT going to be caused by actual data update failure. This code is only executed when the code error appears or connection to DB is lost
                    logger.exception(err)
                    conn.rollback()
                    failed_inserts = count_total - successful_updates_count
                    last_processed_id = last_processed_id + 1

    logger.info(
        f"Finished {etl_name}: total amount of successful updates {successful_updates_count}, total failed updates {failed_inserts}"
    )


def _update_applicant(conn, batch_size, cursor, rows):
    parsed_data_list = _prepare_oats_srw_data(rows)

    execute_batch(
        cursor,
        _update_notification_applicant_query,
        parsed_data_list,
        page_size=batch_size,
    )

    execute_batch(
        cursor,
        _update_submission_applicant_query,
        parsed_data_list,
        page_size=batch_size,
    )

    conn.commit()
    return parsed_data_list


_update_notification_applicant_query = """
                    UPDATE alcs.notification 
                    SET applicant = %(applicant)s
                    WHERE alcs.notification.file_number = %(file_number)s;
"""

_update_submission_applicant_query = """
                    UPDATE alcs.notification_submission 
                    SET applicant = %(applicant)s
                    WHERE alcs.notification_submission.uuid = %(notification_submission_uuid)s;
"""


def _prepare_oats_srw_data(row_data_list):
    mapped_data_list = []
    for row in row_data_list:
        applicant = _get_applicant(row)
        if applicant:
            mapped_data_list.append(
                {
                    "notification_submission_uuid": row["notification_submission_uuid"],
                    "file_number": row["file_number"],
                    "applicant": applicant,
                    "oats_alr_application_party_id": row[
                        "oats_alr_application_party_id"
                    ],
                }
            )

    return mapped_data_list


def _get_applicant(data):
    applicant = data["organization_name"]
    if not applicant:
        applicant = data["last_name"]

    if applicant and data["applicant_suffix"]:
        applicant = f"{applicant} {data['applicant_suffix']}"
    return applicant
