def exclusion_table_create(cursor, conn):
    with open(
        "applications/sql/application-etl-table-create.sql", "r", encoding="utf-8"
    ) as sql_file:
        create_tables = sql_file.read()
        cursor.execute(create_tables)
    conn.commit()


def exclusion_table_count(cursor, logger):
    with open(
        "applications/sql/application_exclude_count.sql", "r", encoding="utf-8"
    ) as sql_file:
        count_exclude = sql_file.read()
        cursor.execute(count_exclude)
        count_total_exclude = cursor.fetchone()[0]
    logger.info(f"Oats applications with excluded components: {count_total_exclude}")
    logger.debug("Component ids stored in oats.alcs_etl_application_exclude")
