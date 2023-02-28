def process_applications(conn):
    """
    Processes ALR (Agricultural Land Reserve) applications by performing the following steps:
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

    cursor = conn.cursor()
    count_sql = "SELECT COUNT(*) FROM oats.oats_alr_applications"
    cursor.execute(count_sql)
    count = cursor.fetchone()[0]
    print("Number of applications: ", count)

    with open("sql/insert-application.sql", "r", encoding="utf-8") as sql_file:
        application_sql = sql_file.read()

    cursor.execute(application_sql)

    cursor.close()
