from common import (
    BATCH_UPLOAD_SIZE,
    OATS_ETL_USER,
    setup_and_get_logger,
    add_timezone_and_keep_date_part,
    DEFAULT_ETL_USER_UUID,
)
from db import inject_conn_pool
from psycopg2.extras import RealDictCursor, execute_batch

etl_name = "planning_review_staff_journal"
logger = setup_and_get_logger(etl_name)


@inject_conn_pool
def process_inquiry_staff_journal(conn=None, batch_size=BATCH_UPLOAD_SIZE):
    """
    This function is responsible for initializing entries for inquiries in staff_journal table in ALCS.

    Args:
    conn (psycopg2.extensions.connection): PostgreSQL database connection. Provided by the decorator.
    batch_size (int): The number of items to process at once. Defaults to BATCH_UPLOAD_SIZE.
    """

    logger.info(f"Start {etl_name}")
    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        with open(
            "inquiry/sql/inquiry_staff_journal_insert_count.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            count_query = sql_file.read()
            cursor.execute(count_query)
            count_total = dict(cursor.fetchone())["count"]
        logger.info(f"Total staff journal entry data to insert: {count_total}")

        failed_inserts_count = 0
        successful_inserts_count = 0
        last_entry_id = 0
        with open(
            "inquiry/sql/inquiry_staff_journal_insert.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            submission_sql = sql_file.read()
            while True:
                cursor.execute(
                    f"{submission_sql} WHERE oin.issue_note_id > '{last_entry_id}' ORDER BY oin.issue_note_id;"
                )

                rows = cursor.fetchmany(batch_size)

                if not rows:
                    break
                try:
                    users_to_be_inserted_count = len(rows)

                    _insert_entries(conn, batch_size, cursor, rows)

                    successful_inserts_count = (
                        successful_inserts_count + users_to_be_inserted_count
                    )
                    last_entry_id = dict(rows[-1])["issue_note_id"]

                    logger.debug(
                        f"retrieved/inserted items count: {users_to_be_inserted_count}; total successfully inserted entries so far {successful_inserts_count}; last inserted note_id: {last_entry_id}"
                    )
                except Exception as err:
                    logger.exception("")
                    conn.rollback()
                    failed_inserts_count = count_total - successful_inserts_count
                    last_entry_id = last_entry_id + 1

    logger.info(
        f"Finished {etl_name}: total amount of successful inserts {successful_inserts_count}, total failed inserts {failed_inserts_count}"
    )


def _insert_entries(conn, batch_size, cursor, rows):
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
                    inquiry_uuid,
                    created_at,
                    author_uuid,
                    audit_created_by
                )
                VALUES (
                    %(note_text)s,
                    %(edit)s,
                    %(uuid)s,
                    %(note_date)s,
                    %(user)s,
                    '{OATS_ETL_USER}'
                )
                ON CONFLICT DO NOTHING;
    """
    return query


def _prepare_journal_data(row_data_list):
    data_list = []
    for row in row_data_list:
        data = dict(row)
        data = _map_revision(data)
        data = _map_timezone(data)
        data["user"] = DEFAULT_ETL_USER_UUID
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
    date = data.get("note_date", "")
    note_date = add_timezone_and_keep_date_part(date)
    data["note_date"] = note_date
    return data


@inject_conn_pool
def clean_inquiry_staff_journal(conn=None):
    logger.info("Start staff journal cleaning")
    # Only clean inquiries
    with conn.cursor() as cursor:
        cursor.execute(
            f"DELETE FROM alcs.staff_journal asj WHERE asj.audit_created_by = '{OATS_ETL_USER}' AND asj.inquiry_uuid IS NOT NULL"
        )
        logger.info(f"Deleted items count = {cursor.rowcount}")

    conn.commit()
