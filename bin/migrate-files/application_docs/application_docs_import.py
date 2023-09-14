from tqdm import tqdm
import cx_Oracle
from common import (
    LAST_IMPORTED_APPLICATION_FILE,
    DocumentUploadBasePath,
    upload_file_to_s3,
    get_starting_document_id,
    get_max_file_size,
    EntityType,
    handle_document_processing_error,
    fetch_data_from_oracle,
    process_results,
    get_last_successfully_uploaded_file_from_log,
    log_last_imported_file,
)


def import_application_docs(batch, cursor, conn, s3):
    starting_document_id = get_last_successfully_uploaded_file_from_log(
        LAST_IMPORTED_APPLICATION_FILE, EntityType.APPLICATION.value
    )

    # Get total number of files
    application_count = _get_total_number_of_files(cursor)
    offset = _get_total_number_of_transferred_files(cursor, starting_document_id)
    print(
        f"{EntityType.APPLICATION.value} count = {application_count} offset = {offset}"
    )

    # Track progress
    documents_processed = 0
    last_document_id = starting_document_id

    try:
        with tqdm(
            total=application_count,
            initial=offset,
            unit="file",
            desc=f"Uploading {EntityType.APPLICATION.value} files to S3",
        ) as documents_upload_progress_bar:
            max_file_size = get_max_file_size(cursor)

            while True:
                starting_document_id = get_starting_document_id(
                    starting_document_id, last_document_id, EntityType.APPLICATION.value
                )

                data = fetch_data_from_oracle(
                    _document_query,
                    starting_document_id,
                    batch,
                    cursor,
                    max_file_size,
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

                    upload_file_to_s3(
                        s3,
                        DocumentUploadBasePath.APPLICATION.value,
                        file_size,
                        document_id,
                        application_id,
                        filename,
                        file,
                    )

                    documents_upload_progress_bar.update(1)
                    last_document_id = document_id
                    documents_processed += 1

                log_last_imported_file(last_document_id, LAST_IMPORTED_APPLICATION_FILE)

    except Exception as error:
        handle_document_processing_error(
            cursor,
            conn,
            error,
            EntityType.APPLICATION.value,
            documents_processed,
            last_document_id,
        )

    # Display results
    process_results(
        EntityType.APPLICATION.value,
        application_count,
        documents_processed,
        last_document_id,
    )

    return


_document_query = """
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


def _get_total_number_of_files(cursor):
    try:
        cursor.execute(
            "SELECT COUNT(*) FROM OATS.OATS_DOCUMENTS WHERE dbms_lob.getLength(DOCUMENT_BLOB) > 0 AND ALR_APPLICATION_ID IS NOT NULL",
        )
        return cursor.fetchone()[0]
    except cx_Oracle.Error as e:
        raise Exception("Oracle Error: {}".format(e))


def _get_total_number_of_transferred_files(cursor, document_id):
    try:
        cursor.execute(
            "SELECT COUNT(*) FROM OATS.OATS_DOCUMENTS WHERE dbms_lob.getLength(DOCUMENT_BLOB) > 0 AND ALR_APPLICATION_ID IS NOT NULL AND DOCUMENT_ID < :document_id",
            {"document_id": document_id},
        )
        return cursor.fetchone()[0]
    except cx_Oracle.Error as e:
        raise Exception("Oracle Error: {}".format(e))
