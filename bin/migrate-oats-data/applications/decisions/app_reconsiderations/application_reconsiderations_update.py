from common import (
    setup_and_get_logger,
    add_timezone_and_keep_date_part,
    AlcsAppReconsiderationOutcomeCodeEnum,
    BATCH_UPLOAD_SIZE,
)
from db import inject_conn_pool
from psycopg2.extras import RealDictCursor, execute_batch

etl_name = "update_application_reconsiderations"
logger = setup_and_get_logger(etl_name)


@inject_conn_pool
def update_application_reconsiderations(conn=None, batch_size=BATCH_UPLOAD_SIZE):
    """
    This function is responsible for updating existing application_reconsideration in ALCS.

    Args:
    conn (psycopg2.extensions.connection): PostgreSQL database connection. Provided by the decorator.
    batch_size (int): The number of items to process at once. Defaults to BATCH_UPLOAD_SIZE.
    """

    logger.info(f"Start {etl_name}")
    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        with open(
            "applications/decisions/sql/reconsiderations/application_reconsideration_update_count.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            count_query = sql_file.read()
            cursor.execute(count_query)
            count_total = dict(cursor.fetchone())["count"]
        logger.info(
            f"Total Application reconsiderations data to updated: {count_total}"
        )

        failed_updates = 0
        successful_updates_count = 0
        last_reconsideration_id = 0

        with open(
            "applications/decisions/sql/reconsiderations/application_reconsideration_update.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            query = sql_file.read()
            while True:
                cursor.execute(
                    f"{query} and orr.reconsideration_request_id > {last_reconsideration_id} ORDER BY orr.reconsideration_request_id;"
                )

                rows = cursor.fetchmany(batch_size)

                if not rows:
                    break
                try:
                    reconsiderations_to_be_updated_count = len(rows)

                    _update_application_reconsiderations(conn, batch_size, cursor, rows)

                    successful_updates_count = (
                        successful_updates_count + reconsiderations_to_be_updated_count
                    )
                    last_reconsideration_id = dict(rows[-1])[
                        "reconsideration_request_id"
                    ]

                    logger.debug(
                        f"retrieved/updated items count: {reconsiderations_to_be_updated_count}; total successfully update reconsiderations so far {successful_updates_count}; last updated reconsideration_request_id: {last_reconsideration_id}"
                    )
                except Exception as err:
                    logger.exception(err)
                    conn.rollback()
                    failed_updates = count_total - successful_updates_count
                    last_reconsideration_id = last_reconsideration_id + 1

    logger.info(
        f"Finished {etl_name}: total amount of successful updates {successful_updates_count}, total failed updates {failed_updates}"
    )


def _update_application_reconsiderations(conn, batch_size, cursor, rows):
    data = _prepare_oats_alr_applications_data(rows)

    if len(data) > 0:
        execute_batch(
            cursor,
            _get_update_query(),
            data,
            page_size=batch_size,
        )

    conn.commit()


def _get_update_query():
    query = f"""
                 UPDATE alcs.application_reconsideration
                    SET submitted_date = %(submitted_date)s
                        , description = COALESCE(alcs.application_reconsideration.description, %(description)s)
                        , oats_reconsideration_request_id = %(oats_reconsideration_request_id)s
                        , is_new_proposal = %(is_new_proposal)s
                        , is_new_evidence = %(is_new_evidence)s
                        , is_incorrect_false_info = %(is_incorrect_false_info)s
                        , review_outcome_code = COALESCE(alcs.application_reconsideration.review_outcome_code, %(review_outcome_code)s)
                        , review_date = %(review_date)s
                    WHERE alcs.application_reconsideration."uuid" = %(reconsideration_uuid)s;
    """
    return query


def _prepare_oats_alr_applications_data(row_data_list):
    data_list = []
    for row in row_data_list:
        mapped_row = {
            "submitted_date": add_timezone_and_keep_date_part(row.get("received_date")),
            "reconsideration_uuid": row.get("reconsideration_uuid"),
            "description": row.get("description"),
            "oats_reconsideration_request_id": row.get("reconsideration_request_id"),
            "is_new_proposal": row.get("new_proposal_ind"),
            "is_new_evidence": row.get("new_information_ind"),
            "is_incorrect_false_info": row.get("error_information_ind"),
            "review_outcome_code": _map_review_outcome_code(row),
            "review_date": _map_review_date(row),
        }
        data_list.append(mapped_row)

    return data_list


def _map_review_outcome_code(row):
    if row.get("approved_date", None) is not None:
        return AlcsAppReconsiderationOutcomeCodeEnum.PROCEED_TO_RECONSIDER.value
    else:
        return AlcsAppReconsiderationOutcomeCodeEnum.PENDING.value


def _map_review_date(row):
    review_code = _map_review_outcome_code(row)
    approved_date = add_timezone_and_keep_date_part(row.get("approved_date"))
    return (
        approved_date
        if review_code
        == AlcsAppReconsiderationOutcomeCodeEnum.PROCEED_TO_RECONSIDER.value
        else None
    )
