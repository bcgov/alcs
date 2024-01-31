from common import (
    setup_and_get_logger,
    BATCH_UPLOAD_SIZE,
)
from db import inject_conn_pool
from psycopg2.extras import RealDictCursor, execute_batch

etl_name = "process_application_applicant_on_submissions"
logger = setup_and_get_logger(etl_name)


@inject_conn_pool
def process_application_applicant_on_submissions(
    conn=None, batch_size=BATCH_UPLOAD_SIZE
):
    logger.info(f"Start {etl_name}")
    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        with open(
            "applications/submissions/sql/applicant/application_applicant_count.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            count_query = sql_file.read()
            cursor.execute(count_query)
            count_total = dict(cursor.fetchone())["count"]
        logger.info(f"Total Applications data to update: {count_total}")

        failed_updates_count = 0
        successful_updates_count = 0
        last_updated_id = "00000000-0000-0000-0000-000000000000"

        with open(
            "applications/submissions/sql/applicant/application_applicant.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            submission_query = sql_file.read()
            while True:
                cursor.execute(
                    f"{submission_query} AND submission_uuid > '{last_updated_id}' ORDER BY submission_uuid;"
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
                    last_updated_id = dict(rows[-1])["submission_uuid"]

                    logger.debug(
                        f"retrieved/updated items count: {records_to_be_updated_count}; total successfully updated applications so far {successful_updates_count}; last updated submission_uuid: {last_updated_id}"
                    )
                except Exception as err:
                    # this is NOT going to be caused by actual data update failure. This code is only executed when the code error appears or connection to DB is lost
                    logger.exception()
                    conn.rollback()
                    failed_updates_count = count_total - successful_updates_count
                    last_updated_id = last_updated_id + 1

    logger.info(
        f"Finished {etl_name}: total amount of successful updates {successful_updates_count}, total failed updates {failed_updates_count}"
    )


def _update_records(conn, batch_size, cursor, rows):
    parsed_data_list = _prepare_data(rows)

    if len(rows) > 0:
        execute_batch(
            cursor,
            _update_query,
            parsed_data_list,
            page_size=batch_size,
        )

    conn.commit()


def _prepare_data(rows):
    data_list = []
    for row in rows:
        data_list.append(_map_data(row))

    return data_list


def _map_data(row):
    applicant = (
        row.get("last_name") if row.get("last_name") else row.get("organization_name")
    )

    if applicant and row.get("owner_count_extension"):
        applicant = f"{applicant} {row.get('owner_count_extension')}"

    return {"applicant": applicant, "submission_uuid": row["submission_uuid"]}


_update_query = """
                    UPDATE alcs.application_submission 
                    SET applicant = %(applicant)s
                    WHERE "uuid" = %(submission_uuid)s;
"""
