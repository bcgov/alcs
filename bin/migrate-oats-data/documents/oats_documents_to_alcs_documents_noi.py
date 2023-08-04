from db import inject_conn_pool

"""
    This script connects to postgress version of OATS DB and transfers data from OATS documents table to ALCS document table.

    NOTE:
    Before performing document_noi import you need to import noi from oats.
"""


def compile_document_insert_query(number_of_rows_to_insert):
    """
    function takes the number of rows to insert and generates an SQL insert statement with upserts using the ON CONFLICT clause
    """
    documents_to_insert = ",".join(["%s"] * number_of_rows_to_insert)
    return f"""
        INSERT INTO alcs."document" (oats_document_id, file_name, oats_application_id, "source", 
                                    audit_created_by, file_key, mime_type, tags, "system") 
        VALUES {documents_to_insert} 
        ON CONFLICT (oats_document_id) DO UPDATE SET 
            oats_document_id = EXCLUDED.oats_document_id, 
            file_name = EXCLUDED.file_name, 
            oats_application_id = EXCLUDED.oats_application_id, 
            "source" = EXCLUDED."source", 
            audit_created_by = EXCLUDED.audit_created_by, 
            file_key = EXCLUDED.file_key, 
            mime_type = EXCLUDED.mime_type,
            tags = EXCLUDED.tags,
            "system" = EXCLUDED."system"
    """


@inject_conn_pool
def process_documents_noi(conn=None, batch_size=10000):
    """
    function uses a decorator pattern @inject_conn_pool to inject a database connection pool to the function. It fetches the total count of documents and prints it to the console. Then, it fetches the documents to insert in batches using document IDs, constructs an insert query, and processes them.
    """
    with conn.cursor() as cursor:
        with open(
            "sql/documents_noi/oats_documents_to_alcs_documents_noi_total_count.sql", "r", encoding="utf-8"
        ) as sql_file:
            count_query = sql_file.read()
            cursor.execute(count_query)
            total_count = cursor.fetchone()[0]
        print("Total count of noi documents to transfer:", total_count)

        failed_inserts = 0
        successful_inserts_count = 0
        last_document_id = 0

        with open("sql/documents_noi/oats_documents_to_alcs_documents_noi.sql", "r", encoding="utf-8") as sql_file:
            documents_to_insert_sql = sql_file.read()
            while True:
                cursor.execute(
                    f"{documents_to_insert_sql} WHERE document_id > {last_document_id} ORDER BY document_id"
                )
                rows = cursor.fetchmany(batch_size)
                if not rows:
                    break
                try:
                    documents_to_be_inserted_count = len(rows)

                    insert_query = compile_document_insert_query(
                        documents_to_be_inserted_count
                    )
                    cursor.execute(insert_query, rows)
                    conn.commit()

                    last_document_id = rows[-1][0]
                    successful_inserts_count = (
                        successful_inserts_count + documents_to_be_inserted_count
                    )

                    print(
                        f"retrieved/inserted items count: {documents_to_be_inserted_count}; total successfully inserted/updated documents so far {successful_inserts_count}; last inserted oats_document_id: {last_document_id}"
                    )
                except Exception as e:
                    conn.rollback()
                    print("Error", e)
                    failed_inserts += len(rows)
                    last_document_id = last_document_id + 1

    print("Total amount of successful inserts:", successful_inserts_count)
    print("Total amount of failed inserts:", failed_inserts)


