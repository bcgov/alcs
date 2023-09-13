from tqdm import tqdm
import cx_Oracle
from config import (
    ecs_bucket,
)


def application_docs(starting_document_id, batch, cursor, conn, s3):
    # Get total number of files
    _get_total_number_of_files(cursor)

    application_count = cursor.fetchone()[0]
    print("Application count =", application_count)

    # Track progress
    documents_processed = 0
    last_document_id = starting_document_id

    try:
        with tqdm(
            total=application_count,
            unit="file",
            desc="Uploading application files to S3",
        ) as application_documents_upload_progress_bar:
            while True:
                starting_document_id = _get_starting_document_id(
                    starting_document_id, last_document_id
                )
                max_file_size = _get_max_file_size(cursor, conn)

                data = _fetch_data_from_oracle(
                    starting_document_id, batch, cursor, max_file_size
                )

                if not data:
                    break
                # Upload the batch to S3 with a progress bar
                for (
                    file_size,
                    document_id,
                    application_id,
                    filename,
                    file,
                ) in data:
                    tqdm.write(f"{application_id}/{document_id}_{filename}")

                    _upload_file_to_s3(
                        s3, file_size, document_id, application_id, filename, file
                    )

                    application_documents_upload_progress_bar.update(1)
                    last_document_id = document_id
                    documents_processed += 1

    except Exception as e:
        _handle_document_processing_error(
            cursor, conn, documents_processed, last_document_id, e
        )

    # Display results
    _process_results(application_count, documents_processed, last_document_id)

    return


_retrieve_document_query = """
                            WITH documents_with_cumulative_file_size AS (
                                        SELECT 
                                            ROW_NUMBER() OVER(
                                                ORDER BY DOCUMENT_ID ASC
                                            ) row_num, 
                                            dbms_lob.getLength(DOCUMENT_BLOB) file_size,
                                            SUM(dbms_lob.getLength(DOCUMENT_BLOB)) OVER (ORDER BY DOCUMENT_ID ASC ROWS UNBOUNDED PRECEDING) AS cumulative_file_size,
                                            DOCUMENT_ID,
                                            ALR_APPLICATION_ID,
                                            FILE_NAME,
                                            DOCUMENT_BLOB,
                                            DOCUMENT_CODE,
                                            DESCRIPTION,
                                            DOCUMENT_SOURCE_CODE,
                                            UPLOADED_DATE,
                                            WHEN_UPDATED,
                                            REVISION_COUNT
                                        FROM
                                            OATS.OATS_DOCUMENTS
                                        WHERE
                                            dbms_lob.getLength(DOCUMENT_BLOB) > 0
                                            AND DOCUMENT_ID > :starting_document_id
                                            AND ALR_APPLICATION_ID IS NOT NULL
                                        ORDER BY
                                            DOCUMENT_ID ASC
                                        )
                                        SELECT
                                            file_size,
                                            DOCUMENT_ID,
                                            ALR_APPLICATION_ID,
                                            FILE_NAME,
                                            DOCUMENT_BLOB
                                        FROM
                                            documents_with_cumulative_file_size
                                        WHERE 
                                            cumulative_file_size < :max_file_size
                                            AND row_num < :batch_size
                                        ORDER BY
                                            DOCUMENT_ID ASC
                            """


def _record_last_imported_file(last_document_id):
    with open("last_imported_file.txt", "w") as file:
        file.write(str(last_document_id))


def _get_max_file_size(cursor, conn):
    file_size_reserve = 5242880  # 5 Megabytes in bytes
    try:
        cursor.execute(
            "SELECT MAX(dbms_lob.getLength(DOCUMENT_BLOB)) FROM OATS.OATS_DOCUMENTS"
        )
        max_file_size = cursor.fetchone()[0] + file_size_reserve
    except Exception as e:
        raise Exception("Oracle Error: {}".format(e))

    default_max_size = 1073741824  # default the max_file_size to 1 Gigabyte in bytes
    return default_max_size if default_max_size > max_file_size else max_file_size


def _process_results(application_count, documents_processed, last_document_id):
    print(
        "Process complete: Successfully migrated",
        documents_processed,
        "out of",
        application_count,
        "application files.",
    )

    _record_last_imported_file(last_document_id)


def _handle_document_processing_error(
    cursor, conn, documents_processed, last_document_id, e
):
    print("Something went wrong with application document upload:", e)
    print("Processed", documents_processed, "application files")

    # Set resume status in case of interruption
    _record_last_imported_file(last_document_id)

    cursor.close()
    conn.close()
    exit()


def _upload_file_to_s3(s3, file_size, document_id, application_id, filename, file):
    with tqdm(
        total=file_size, unit="B", unit_scale=True, desc=filename
    ) as upload_progress_bar:
        s3.upload_fileobj(
            file,
            ecs_bucket,
            f"migrate/application/{application_id}/{document_id}_{filename}",
            Callback=lambda bytes_transferred: upload_progress_bar.update(
                bytes_transferred
            ),
        )


def _fetch_data_from_oracle(starting_document_id, batch, cursor, max_file_size):
    cursor.execute(
        _retrieve_document_query,
        {
            "starting_document_id": starting_document_id,
            "max_file_size": max_file_size,
            "batch_size": batch,
        },
    )

    # Fetch the next batch of BLOB data
    data = cursor.fetchmany(batch)
    return data


def _get_starting_document_id(starting_document_id, last_document_id):
    if starting_document_id > last_document_id:
        raise Exception(
            "ERROR: starting_document_id > last_document_id. Wrong order of application import!",
            starting_document_id,
            last_document_id,
        )

    return starting_document_id


def _get_total_number_of_files(cursor):
    try:
        cursor.execute(
            "SELECT COUNT(*) FROM OATS.OATS_DOCUMENTS WHERE dbms_lob.getLength(DOCUMENT_BLOB) > 0 AND ALR_APPLICATION_ID IS NOT NULL"
        )
    except cx_Oracle.Error as e:
        raise Exception("Oracle Error: {}".format(e))
