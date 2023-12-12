from common import (
    BATCH_UPLOAD_SIZE,
    OATS_ETL_USER,
    setup_and_get_logger,
    add_timezone_and_keep_date_part,
)
from db import inject_conn_pool
from psycopg2.extras import RealDictCursor, execute_batch

etl_name = "noi_staff_journal"
logger = setup_and_get_logger(etl_name)


@inject_conn_pool
def process_noi_staff_journal(conn=None, batch_size=BATCH_UPLOAD_SIZE):
    """
    Process notice of intent staff journal entries

    Args:
    conn (psycopg2.extensions.connection): PostgreSQL database connection. Provided by the decorator.
    batch_size (int): The number of items to process at once. Defaults to BATCH_UPLOAD_SIZE.
    """

    logger.info(f"Start {etl_name}")
    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        with open(
            "noi/sql/noi_staff_journal/noi_staff_journal_count.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            count_query = sql_file.read()
            cursor.execute(count_query)
            count_total = dict(cursor.fetchone())["count"]
        logger.info(f"Total staff journal entry data to insert: {count_total}")

        failed_inserts = 0
        successful_inserts_count = 0
        last_entry_id = 0
        with open(
            "noi/sql/noi_staff_journal/noi_staff_journal.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            submission_sql = sql_file.read()
            while True:
                cursor.execute(
                    f"{submission_sql} WHERE osj.staff_journal_entry_id > '{last_entry_id}' ORDER BY osj.staff_journal_entry_id;"
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
                    last_entry_id = dict(rows[-1])["staff_journal_entry_id"]

                    logger.debug(
                        f"retrieved/inserted items count: {users_to_be_inserted_count}; total successfully inserted entries so far {successful_inserts_count}; last inserted journal_id: {last_entry_id}"
                    )
                except Exception as err:
                    logger.exception(err)
                    conn.rollback()
                    failed_inserts = count_total - successful_inserts_count
                    last_entry_id = last_entry_id + 1

    logger.info(
        f"Finished {etl_name}: total amount of successful inserts {successful_inserts_count}, total failed inserts {failed_inserts}"
    )


def _insert_users(conn, batch_size, cursor, rows):
    """Get insertion query, process data, and run query"""

    query = _get_insert_query()
    parsed_data_list = _prepare_journal_data(rows)

    if len(parsed_data_list) > 0:
        execute_batch(cursor, query, parsed_data_list, page_size=batch_size)

    conn.commit()


def _get_insert_query():
    query = f"""
                INSERT INTO alcs.staff_journal (
                    body,
                    edited,
                    notice_of_intent_uuid,
                    created_at,
                    audit_created_by
                )
                VALUES (
                    %(journal_text)s,
                    %(edit)s,
                    %(uuid)s,
                    %(journal_date)s,
                    '{OATS_ETL_USER}'
                )
                ON CONFLICT DO NOTHING;
    """
    return query


def _prepare_journal_data(row_data_list):
    """Processes data from OATS into the correct format for ALCS"""

    data_list = []
    for row in row_data_list:
        data = dict(row)
        data = _map_revision(data)
        data = _map_timezone(data)
        data_list.append(dict(data))

    return data_list


def _map_revision(data):
    revision = data.get("revision_count", "")
    # check if edited
    if revision == 0:
        data["edit"] = False
    else:
        data["edit"] = True
    return data


def _map_timezone(data):
    date = data.get("journal_date", "")
    journal_date = add_timezone_and_keep_date_part(date)
    data["journal_date"] = journal_date
    return data


@inject_conn_pool
def clean_noi_staff_journal(conn=None):
    logger.info("Start staff journal cleaning")
    with conn.cursor() as cursor:
        cursor.execute(
            f"DELETE FROM alcs.staff_journal AS asj WHERE asj.audit_created_by = '{OATS_ETL_USER}' AND asj.notice_of_intent_uuid IS NOT NULL"
        )
        logger.info(f"Deleted items count = {cursor.rowcount}")

    conn.commit()
