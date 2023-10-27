from common import OATS_ETL_USER, setup_and_get_logger, BATCH_UPLOAD_SIZE
from db import inject_conn_pool
from psycopg2.extras import RealDictCursor, execute_batch

etl_name = "init_application_statuses"
logger = setup_and_get_logger(etl_name)


@inject_conn_pool
def init_application_statuses(conn=None):
    """
    This function is responsible for initializing application statuses.
    Initializing means inserting status_to_submission record without the effective_date.

    Args:
    conn (psycopg2.extensions.connection): PostgreSQL database connection. Provided by the decorator.
    batch_size (int): The number of items to process at once. Defaults to BATCH_UPLOAD_SIZE.
    """
    logger.info(f"Start {etl_name}")
    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        with open(
            "applications/submissions/sql/statuses/init_app_submission_status_count.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            count_query = sql_file.read()
            cursor.execute(count_query)
            count_total = dict(cursor.fetchone())["count"]
        logger.info(f"Total Application data to insert: {count_total}")
        failed_inserts = 0
        successful_inserts_count = 0
        last_application_id = 0

        with open(
            "applications/submissions/sql/statuses/init_app_submission_status.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            query = sql_file.read()

            try:
                cursor.execute(query)
                conn.commit()
                successful_inserts_count = cursor.rowcount
            except Exception as err:
                logger.exception()
                conn.rollback()
                failed_inserts = count_total - successful_inserts_count
                last_application_id = last_application_id + 1

    logger.info(
        f"Finished {etl_name}: total amount of successful inserts {successful_inserts_count}, total failed updates {failed_inserts}"
    )


@inject_conn_pool
def clean_application_submission_statuses(conn=None):
    logger.debug("Start application_statuses cleaning")
    with conn.cursor() as cursor:
        cursor.execute(
            f"""DELETE FROM alcs.application_submission_to_submission_status app_st 
                USING alcs.application_submission apss
                WHERE app_st.submission_uuid = apss.uuid AND apss.audit_created_by = '{OATS_ETL_USER}';"""
        )
        logger.info(f"Deleted items count = {cursor.rowcount}")

    conn.commit()


@inject_conn_pool
def batch_application_statuses(conn=None, batch_size=BATCH_UPLOAD_SIZE):
    """
    This function is responsible for initializing application statuses.
    Initializing means inserting status_to_submission record without the effective_date.

    Args:
    conn (psycopg2.extensions.connection): PostgreSQL database connection. Provided by the decorator.
    batch_size (int): The number of items to process at once. Defaults to BATCH_UPLOAD_SIZE.
    """
    logger.info(f"Start {etl_name}")
    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        with open(
            "applications/submissions/sql/statuses/init_app_submission_status_count.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            count_query = sql_file.read()
            cursor.execute(count_query)
            count_total = dict(cursor.fetchone())["count"]
        logger.info(f"Total Application data to insert: {count_total}")
        print(count_total)
        failed_inserts = 0
        successful_inserts_count = 0
        last_application_id = 0
        # mod_batch allows batching to work at the closest integer division of 12 which is the number of unique status types in alcs applications
        mod_batch = batch_size // 12
        mod_batch = mod_batch * 12
        with open(
            "applications/submissions/sql/statuses/init_app_submission_status_batch.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            query = sql_file.read()
            while True:
                cursor.execute(
                    f"{query} WHERE asup.alr_application_id > {last_application_id} ORDER by asup.alr_application_id;"
                )
                rows = cursor.fetchmany(mod_batch)
                if not rows:
                    break
                try:
                    applications_to_be_inserted_count = len(rows)

                    _get_insert_query(cursor, rows, mod_batch, conn)
                    conn.commit()
                    last_application_id = dict(rows[-1])["alr_application_id"]
                    successful_inserts_count = (
                        successful_inserts_count + applications_to_be_inserted_count
                    )

                    logger.info(
                        f"retrieved/inserted items count: {applications_to_be_inserted_count}; total successfully inserted/updated applications so far {successful_inserts_count}; last inserted applidation_id: {last_application_id}"
                    )
                except Exception as err:
                    logger.exception()
                    conn.rollback()
                    failed_inserts = count_total - successful_inserts_count
                    last_application_id = last_application_id + 1

    logger.info(
        f"Finished {etl_name}: total amount of successful inserts {successful_inserts_count}, total failed updates {failed_inserts}"
    )


def _get_insert_query(cursor, rows, batch_size, conn):
    execute_batch(
        cursor,
        _insert_query(),
        rows,
        page_size=batch_size,
    )


def _insert_query():
    query = """
                INSERT INTO alcs.application_submission_to_submission_status (
                    submission_uuid,
                    status_type_code
                )
                VALUES (
                    %(uuid)s,
                    %(sscode)s
                )
    """
    return query
