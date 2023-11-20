from common import BATCH_UPLOAD_SIZE, OATS_ETL_USER, setup_and_get_logger
from db import inject_conn_pool
from psycopg2.extras import RealDictCursor, execute_batch
import uuid

etl_name = "init_alcs_users"
logger = setup_and_get_logger(etl_name)


@inject_conn_pool
def init_alcs_users(conn=None, batch_size=BATCH_UPLOAD_SIZE):
    """
    This function is responsible for initializing the users table in ALCS.

    Args:
    conn (psycopg2.extensions.connection): PostgreSQL database connection. Provided by the decorator.
    batch_size (int): The number of items to process at once. Defaults to BATCH_UPLOAD_SIZE.
    """

    logger.info(f"Start {etl_name}")
    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        with open(
            "sql/common/init_users_count.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            count_query = sql_file.read()
            cursor.execute(count_query)
            count_total = dict(cursor.fetchone())["count"]
        logger.info(f"Total users data to insert: {count_total}")

        failed_inserts = 0
        successful_inserts_count = 0
        last_submission_id = "-"
        with open(
            "sql/common/init_users.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            submission_sql = sql_file.read()
            while True:
                cursor.execute(
                    f"{submission_sql} AND oaa.created_guid > '{last_submission_id}' ORDER BY oaa.created_guid;"
                )

                rows = cursor.fetchmany(batch_size)

                if not rows:
                    break
                try:
                    users_to_be_inserted_count = len(rows)

                    _insert_users(conn, batch_size, cursor, rows)

                    successful_inserts_count = (
                        successful_inserts_count + users_to_be_inserted_count
                    )
                    last_submission_id = dict(rows[-1])["created_guid"]

                    logger.debug(
                        f"retrieved/inserted items count: {users_to_be_inserted_count}; total successfully inserted users so far {successful_inserts_count}; last inserted guid: {last_submission_id}"
                    )
                except Exception as err:
                    logger.exception()
                    conn.rollback()
                    failed_inserts = count_total - successful_inserts_count
                    last_submission_id = last_submission_id + 1

    logger.info(
        f"Finished {etl_name}: total amount of successful inserts {successful_inserts_count}, total failed inserts {failed_inserts}"
    )


def _insert_users(conn, batch_size, cursor, rows):
    """ """
    query = _get_insert_query()
    parsed_data_list = _prepare_users_data(rows)

    if len(parsed_data_list) > 0:
        execute_batch(cursor, query, parsed_data_list, page_size=batch_size)

    conn.commit()


def _get_insert_query():
    query = f"""
                INSERT INTO alcs.user (
                    bceid_guid,
                    email,
                    display_name,
                    identity_provider,
                    preferred_username,
                    audit_created_by
                )
                VALUES (
                    %(created_guid)s,
                    '11@11',
                    'etl_imported_display_name',
                    'bceid_etl',
                    'etl_imported_username',
                    '{OATS_ETL_USER}'
                )
    """
    return query


def _prepare_users_data(row_data_list):
    data_list = []
    for row in row_data_list:
        data_list.append(dict(row))
    return data_list


@inject_conn_pool
def clean_users(conn=None):
    logger.info("Start users cleaning")
    with conn.cursor() as cursor:
        cursor.execute(
            f"DELETE FROM alcs.user alu WHERE alu.audit_created_by = '{OATS_ETL_USER}'"
        )
        logger.info(f"Deleted items count = {cursor.rowcount}")

    conn.commit()
