from common import (
    setup_and_get_logger,
    add_timezone_and_keep_date_part,
    AlcsNoiModificationOutcomeCodeEnum,
)
from db import inject_conn_pool
from psycopg2.extras import RealDictCursor, execute_batch

etl_name = "link_notice_of_intent_modifications"
logger = setup_and_get_logger(etl_name)


@inject_conn_pool
def link_notice_of_intent_modifications(conn=None, batch_size=1000):
    """
    This function is responsible for linking notice_of_intent_modification to notice_of_intent_decisions in ALCS.

    Args:
    conn (psycopg2.extensions.connection): PostgreSQL database connection. Provided by the decorator.
    batch_size (int): The number of items to process at once. Defaults to BATCH_UPLOAD_SIZE.
    """

    logger.info(f"Start {etl_name}")
    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        with open(
            "noi/sql/notice_of_intent_decisions/modifications/notice_of_intent_modification_link_to_decisions_count.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            count_query = sql_file.read()
            cursor.execute(count_query)
            count_total = dict(cursor.fetchone())["count"]
        logger.info(f"Total Notice of Intent Modifications data to link: {count_total}")

        failed_updates = 0
        successful_updates_count = 0
        last_modification_id = 0

        with open(
            "noi/sql/notice_of_intent_decisions/modifications/notice_of_intent_modification_link_to_decisions.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            query = sql_file.read()
            while True:
                cursor.execute(
                    f"{query} and orr.reconsideration_request_id > {last_modification_id} ORDER BY orr.reconsideration_request_id;"
                )

                rows = cursor.fetchmany(batch_size)

                if not rows:
                    break
                try:
                    modifications_to_be_updated_count = len(rows)

                    _update_notice_of_intent_modifications(
                        conn, batch_size, cursor, rows
                    )

                    successful_updates_count = (
                        successful_updates_count + modifications_to_be_updated_count
                    )
                    last_modification_id = dict(rows[-1])["reconsideration_request_id"]

                    logger.debug(
                        f"retrieved/linked items count: {modifications_to_be_updated_count}; total successfully linked modifications so far {successful_updates_count}; last updated reconsideration_request_id: {last_modification_id}"
                    )
                except Exception as err:
                    logger.exception(err)
                    conn.rollback()
                    failed_updates = count_total - successful_updates_count
                    last_modification_id = last_modification_id + 1

    logger.info(
        f"Finished {etl_name}: total amount of successful linked {successful_updates_count}, total failed updates {failed_updates}"
    )


def _update_notice_of_intent_modifications(conn, batch_size, cursor, rows):
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
                 UPDATE alcs.notice_of_intent_decision
                    SET modifies_uuid = %(modification_uuid)s
                    WHERE alcs.notice_of_intent_decision."uuid" = %(decision_uuid)s
    """
    return query


def _prepare_oats_alr_applications_data(row_data_list):
    data_list = []
    for row in row_data_list:
        mapped_row = {
            "modification_uuid": row["modification_uuid"],
            "decision_uuid": row["decision_uuid"],
            "reconsideration_request_id": row["reconsideration_request_id"],
        }
        data_list.append(mapped_row)

    return data_list
