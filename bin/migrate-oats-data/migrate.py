import os
import psycopg2
from dotenv import load_dotenv
from tqdm import tqdm

from applications import process_applications

# Load environment variables from .env file
load_dotenv()

# Load the database connection secrets from environment variables
db_username = os.getenv("DB_USERNAME")
db_password = os.getenv("DB_PASSWORD")
db_host = os.getenv("DB_HOST")
db_port = os.getenv("DB_PORT")
db_database = os.getenv("DB_DATABASE")

conn = psycopg2.connect(
    host=db_host,
    port=db_port,
    database=db_database,
    user=db_username,
    password=db_password,
)

try:
    process_applications(conn)
finally:
    conn.close()
