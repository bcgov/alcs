from .log_file_helper import log_last_imported_file
from .constants import LAST_IMPORTED_APPLICATION_FILE
import traceback


def get_max_file_size(cursor):
    file_size_reserve = 5242880  # 5 Megabytes in bytes
    try:
        cursor.execute(
            "SELECT MAX(dbms_lob.getLength(DOCUMENT_BLOB)) FROM OATS.OATS_DOCUMENTS",
        )
        max_file_size = cursor.fetchone()[0] + file_size_reserve
    except Exception as e:
        raise Exception("Oracle Error: {}".format(e))

    default_max_size = 1073741824  # default the max_file_size to 1 Gigabyte in bytes
    return default_max_size if default_max_size > max_file_size else max_file_size


def get_starting_document_id(starting_document_id, last_document_id, entity_type):
    if int(starting_document_id) > int(last_document_id):
        raise Exception(
            f"ERROR: starting_document_id > last_document_id. Wrong order of {entity_type} import!",
            starting_document_id,
            last_document_id,
        )

    return last_document_id


def fetch_data_from_oracle(document_query, cursor, params):
    cursor.execute(document_query, params)

    # Fetch the next batch of BLOB data
    data = cursor.fetchmany(params["batch_size"])
    return data


def handle_document_processing_error(
    cursor,
    conn,
    error,
    entity_type,
    documents_processed,
    last_document_id,
    log_file_name,
):
    print(f"Something went wrong with {entity_type} document upload:")
    print("".join(traceback.format_exception(None, error, error.__traceback__)))
    print(f"Processed {documents_processed} {entity_type} files")

    log_last_imported_file(last_document_id, log_file_name)

    cursor.close()
    conn.close()
    exit()


def process_results(
    entity_type, document_count, documents_processed, last_document_id, log_file_name
):
    print(
        f"Process complete: Successfully migrated {documents_processed} out of {document_count} {entity_type} files.",
    )

    log_last_imported_file(last_document_id, log_file_name)
