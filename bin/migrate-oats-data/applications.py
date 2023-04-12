from db import inject_conn_pool


@inject_conn_pool
def process_applications(conn=None):
    """
    Processes ALR applications by performing the following steps:
        - Retrieves metadata about the applications from the oats.oats_alr_applications table.
        - Runs an SQL script to retrieve the necessary data from related tables and inserts new records into the
          alcs_applications table.

    Parameters:
        conn (psycopg2.extensions.connection): A psycopg2 connection object to the database.

    Returns:
        None.

    Raises:
        psycopg2.OperationalError: If there is an error executing the SQL script or committing the transaction.
    """

    with conn.cursor() as cursor:
        count_sql = "SELECT COUNT(*) FROM oats.oats_alr_applications"
        cursor.execute(count_sql)
        count_total = cursor.fetchone()[0]
        print("- Applications to insert: ", count_total)

        with open("sql/insert-application.sql", "r", encoding="utf-8") as sql_file:
            application_sql = sql_file.read()

        cursor.execute(application_sql)

    with conn.cursor() as cursor:
        cursor.execute(
            "select count(*) from alcs.application a where a.audit_created_by = 'oats_etl'"
        )
        final_count = cursor.fetchone()
        print("- Actual inserted: ", final_count[0])


@inject_conn_pool
def clean_applications(conn=None):
    with conn.cursor() as cursor:
        cursor.execute(
            "DELETE FROM alcs.application a WHERE a.audit_created_by = 'oats_etl'"
        )
        cursor.execute("DELETE FROM alcs.card c WHERE c.audit_created_by = 'oats_etl'")
