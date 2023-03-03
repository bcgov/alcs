import os
import psycopg2.pool
from dotenv import load_dotenv

load_dotenv()

# Create connection pool
db_config = {
    key: os.getenv(f"DB_{key.upper()}")
    for key in ["user", "password", "host", "port", "database"]
}
connection_pool = psycopg2.pool.SimpleConnectionPool(1, 10, **db_config)


def inject_conn_pool(func):
    def wrapper(*args, **kwargs):
        with connection_pool.getconn() as conn:
            return func(conn, *args, **kwargs)

    return wrapper
