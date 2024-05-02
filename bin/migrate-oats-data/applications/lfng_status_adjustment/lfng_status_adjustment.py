from common import (
    BATCH_UPLOAD_SIZE,
    setup_and_get_logger,
    add_timezone_and_keep_date_part,
)
from db import inject_conn_pool
from psycopg2.extras import RealDictCursor

etl_name = "readjust_lfng_statuses"
logger = setup_and_get_logger(etl_name)


@inject_conn_pool
def readjust_lfng_statuses(conn=None, batch_size=BATCH_UPLOAD_SIZE):
    """
    TODO copy description from JIRA

    Args:
    conn (psycopg2.extensions.connection): PostgreSQL database connection. Provided by the decorator.
    batch_size (int): The number of items to process at once. Defaults to BATCH_UPLOAD_SIZE.
    """

    logger.info(f"Start {etl_name}")
    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        with open(
            "applications/lfng_status_adjustment/sql/oats_latest_lfng_status_count.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            count_query = sql_file.read()
            cursor.execute(count_query)
            count_total = dict(cursor.fetchone())["count"]
        logger.info(f"Total applications to process: {count_total}")

        failed_inserts = 0
        successful_updates_count = 0
        last_entry_id = 0
        with open(
            "applications/lfng_status_adjustment/sql/oats_latest_lfng_status.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            query = sql_file.read()
            while True:
                cursor.execute(
                    f"""
                        {query} 
                        AND lols.alr_application_id > {last_entry_id} 
                        ORDER BY lols.alr_application_id;
                    """
                )

                rows = cursor.fetchmany(batch_size)

                if not rows:
                    break
                try:
                    processed_applications_count = _process_statuses_for_update(
                        conn, batch_size, cursor, rows
                    )

                    successful_updates_count = (
                        successful_updates_count + processed_applications_count
                    )
                    last_entry_id = dict(rows[-1])["alr_application_id"]

                    logger.info(
                        f"retrieved/updated items count: {processed_applications_count}; total successfully updated entries so far {successful_updates_count}; last updated alr_application_id: {last_entry_id}"
                    )
                except Exception as err:
                    logger.exception(err)
                    conn.rollback()
                    failed_inserts = count_total - successful_updates_count
                    last_entry_id = last_entry_id + 1

    logger.info(
        f"Finished {etl_name}: total amount of successful inserts {successful_updates_count}, total failed inserts {failed_inserts}"
    )


def _process_statuses_for_update(conn, batch_size, cursor, rows):

    update_statements = []
    grouped_by_fn = []
    processed_applications_count = 0

    for row in rows:
        if not grouped_by_fn or (
            grouped_by_fn
            and grouped_by_fn[0]["alr_application_id"] == row["alr_application_id"]
        ):
            grouped_by_fn.append(row)
        else:
            _prepare_update_statement(grouped_by_fn, update_statements)

            processed_applications_count += 1
            grouped_by_fn = []
            grouped_by_fn.append(row)

    combined_statements = "; ".join(update_statements)
    # this is useful for debugging
    # logger.debug("combined_statements: %s", combined_statements)
    cursor.execute(combined_statements)
    conn.commit()
    return processed_applications_count


def _prepare_update_statement(statuses, update_statements):
    oats_status = statuses[0]["accomplishment_code"]
    alcs_status = _map_oats_accomplishment_code_to_alcs_status_code(oats_status)

    if alcs_status == "RFFG":
        update_statements.append(
            _compile_update_statement(statuses, oats_status, "RFFG", [])
        )
    elif alcs_status == "REVG":
        update_statements.append(
            _compile_update_statement(statuses, oats_status, "REVG", ["RFFG"])
        )
    elif alcs_status == "SUBG":
        update_statements.append(
            _compile_update_statement(statuses, oats_status, "SUBG", ["RFFG", "REVG"])
        )
    elif alcs_status == "INCM":
        update_statements.append(
            _compile_update_statement(
                statuses, oats_status, "INCM", ["RFFG", "REVG", "SUBG", "WRNG"]
            )
        )
    elif alcs_status == "WRNG":
        update_statements.append(
            _compile_update_statement(
                statuses, oats_status, "WRNG", ["RFFG", "REVG", "SUBG", "INCM"]
            )
        )


def _compile_update_statement(
    statuses, oats_target_status, alcs_target_status, alcs_reset_statuses_codes=None
):
    oats_status = _get_oats_status(statuses, oats_target_status)
    alcs_status = _get_alcs_status(statuses, oats_target_status)

    str_statuses_to_reset = ""
    reset_statuses_query = ""

    if alcs_reset_statuses_codes:
        str_statuses_to_reset = "', '".join(alcs_reset_statuses_codes)
        reset_statuses_query = f"""
            UPDATE alcs.application_submission_to_submission_status 
            SET effective_date = NULL,
                email_sent_date = NULL
            WHERE status_type_code in ('{str_statuses_to_reset}') AND submission_uuid = '{oats_status["uuid"]}';
        """

    if alcs_status:
        logger.debug(f"reset {str_statuses_to_reset}")
        return reset_statuses_query
    else:
        logger.debug(f"{str_statuses_to_reset} and set {alcs_target_status}")
        date = add_timezone_and_keep_date_part(oats_status["completion_date"])
        return f"""
                    {reset_statuses_query}

                    UPDATE alcs.application_submission_to_submission_status 
                    SET effective_date = '{date}',
                        email_sent_date = '0001-01-01 06:00:00.000 -0800'
                    WHERE status_type_code = '{alcs_target_status}' AND submission_uuid = '{oats_status["uuid"]}';
                """


def _get_oats_status(statuses, code):
    for status in statuses:
        if status["accomplishment_code"] == code:
            return status
    return None


def _get_alcs_status(statuses, code):
    for status in statuses:
        if status["status_type_code"] == code:
            return status
    return None


def _map_oats_accomplishment_code_to_alcs_status_code(code):
    if code == "LRF":
        return "RFFG"
    if code == "SLG":
        return "SUBG"
    if code == "WLG":
        return "WRNG"
    if code == "ULG":
        return "REVG"
    if code == "LGI":
        return "INCM"
