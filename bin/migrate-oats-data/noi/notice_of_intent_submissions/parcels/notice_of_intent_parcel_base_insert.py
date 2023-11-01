from common import setup_and_get_logger, BATCH_UPLOAD_SIZE
from db import inject_conn_pool

etl_name = "init_notice_of_intent_parcels"
logger = setup_and_get_logger(etl_name)


@inject_conn_pool
def init_notice_of_intent_parcels(conn=None, batch_size=BATCH_UPLOAD_SIZE):
    logger.info(f"Start {etl_name}")

    with conn.cursor() as cursor:
        with open(
            "noi/sql/notice_of_intent_submission/parcels/notice_of_intent_parcels_base_insert_count.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            count_query = sql_file.read()
            cursor.execute(count_query)
            count_total = cursor.fetchone()[0]
        logger.info(f"Total Notice of Intents Parcels to insert: {count_total}")

        failed_inserts = 0
        successful_inserts_count = 0
        last_subject_property_id = 0

        with open(
            "noi/sql/notice_of_intent_submission/parcels/notice_of_intent_parcels_base_insert.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            application_sql = sql_file.read()
            while True:
                cursor.execute(
                    f"{application_sql} WHERE subject_property_id > {last_subject_property_id} ORDER BY subject_property_id;"
                )

                rows = cursor.fetchmany(batch_size)

                if not rows:
                    break
                try:
                    records_to_be_inserted_count = len(rows)
                    # logger.debug(rows)

                    _insert_records(conn, cursor, rows)

                    successful_inserts_count = (
                        successful_inserts_count + records_to_be_inserted_count
                    )
                    last_subject_property_id = rows[-1][-1]

                    logger.debug(
                        f"inserted items count: {records_to_be_inserted_count}; total successfully inserted notice of intent parcels so far {successful_inserts_count}; last inserted subject_property_id: {last_subject_property_id}"
                    )
                except Exception as err:
                    # this is NOT going to be caused by actual data update failure. This code is only executed when the code error appears or connection to DB is lost
                    logger.exception(err)
                    conn.rollback()
                    failed_inserts = count_total - successful_inserts_count
                    last_subject_property_id = last_subject_property_id + 1

    logger.info(
        f"Finished {etl_name}: total amount of successful inserts {successful_inserts_count}, total failed inserts {failed_inserts}"
    )


def _insert_records(conn, cursor, rows):
    number_of_rows_to_insert = len(rows)

    # logger.debug(insert_query)

    if number_of_rows_to_insert > 0:
        insert_query = _compile_application_insert_query(number_of_rows_to_insert)
        rows_to_insert = _prepare_data_to_insert(rows)
        # logger.debug(rows_to_insert)
        cursor.execute(insert_query, rows_to_insert)
        conn.commit()


def _prepare_data_to_insert(rows):
    row_without_last_element = []
    for row in rows:
        row_without_last_element.append(row[:-1])

    return row_without_last_element


def _compile_application_insert_query(number_of_rows_to_insert):
    parcels_to_insert = ",".join(["%s"] * number_of_rows_to_insert)
    return f"""
                    INSERT INTO alcs.notice_of_intent_parcel (notice_of_intent_submission_uuid, audit_created_by, is_confirmed_by_applicant)
                    VALUES{parcels_to_insert}
                    ON CONFLICT DO NOTHING
                """


@inject_conn_pool
def clean_parcels(conn=None):
    logger.info("Start notice of intent parcel cleaning")
    with conn.cursor() as cursor:
        cursor.execute(
            "DELETE FROM alcs.notice_of_intent_parcel noip WHERE noip.audit_created_by = 'oats_etl'"
        )
        logger.info(f"Deleted items count = {cursor.rowcount}")
    conn.commit()
    logger.info("Done notice of intent parcel cleaning")
