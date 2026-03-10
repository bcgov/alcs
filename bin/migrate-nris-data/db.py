import os

from dotenv import load_dotenv
from psycopg2.extras import RealDictCursor, execute_values
import psycopg2.pool
from rich.progress import BarColumn, Progress, SpinnerColumn

from common.constants import DEFAULT_ETL_USER_UUID
from config import ABS_PATH

load_dotenv()

# Create connection pool
db_config = {
    key: os.getenv(f"DB_{key.upper()}")
    for key in ["user", "password", "host", "port", "database"]
}
connection_pool = psycopg2.pool.SimpleConnectionPool(1, 10, **db_config)


def inject_conn_from_pool(func):
    def wrapper(*args, **kwargs):
        conn = connection_pool.getconn()

        try:
            result = func(conn, *args, **kwargs)

        finally:
            conn.close()
            connection_pool.putconn(conn)

        return result

    return wrapper


@inject_conn_from_pool
def ensure_ce_users(conn, logger):
    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        sql = load_sql(
            ABS_PATH / "common/sql/ensure_ce_users.sql",
        )

        try:
            cursor.execute(
                sql,
                {
                    "user_uuid": DEFAULT_ETL_USER_UUID,
                    "creator_uuid": DEFAULT_ETL_USER_UUID,
                },
            )
        except Exception as err:
            logger.exception(err)
            conn.rollback()

        conn.commit()


@inject_conn_from_pool
@inject_conn_from_pool
def batch_read_write(
    read_conn,
    write_conn,
    logger,
    batch_size,
    count_file_path,
    read_file_path,
    write_file_path,
    row_processor=None,
):
    count_sql = load_sql(count_file_path)
    read_sql = load_sql(read_file_path)
    write_sql = load_sql(write_file_path)

    with read_conn.cursor() as count_cursor:
        count_cursor.execute(count_sql)
        count_total = count_cursor.fetchone()[0]

    logger.info(f"Total records to write: {count_total}")

    num_successful = 0

    with read_conn.cursor(
        name="read_cursor", cursor_factory=RealDictCursor
    ) as read_cursor, write_conn.cursor() as write_cursor:
        read_cursor.execute(read_sql)

        with Progress(SpinnerColumn(), BarColumn(), transient=True) as progress:
            task = progress.add_task("Progress:", total=count_total)

            while rows := read_cursor.fetchmany(batch_size):
                curr_batch_size = len(rows)

                if row_processor:
                    rows = map(row_processor, rows)

                try:
                    execute_values(
                        write_cursor,
                        write_sql,
                        (list(row.values()) for row in rows),
                    )
                    write_conn.commit()

                    num_successful += curr_batch_size

                    progress.update(task, advance=curr_batch_size)
                    logger.debug(
                        f"{curr_batch_size} records ran successfully; {num_successful} of {count_total} records run so far."
                    )

                except Exception as err:
                    logger.exception(err)
                    write_conn.rollback()
                    logger.info(f"Failed to run batch of {curr_batch_size}.")

        logger.info(f"Successfully ran {num_successful} of {count_total} records.")


def load_sql(file_path):
    with open(
        file_path,
        "r",
        encoding="utf-8",
    ) as sql_file:
        return sql_file.read()
