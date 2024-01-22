from common import (
    setup_and_get_logger,
    BATCH_UPLOAD_SIZE,
    OATS_ETL_USER,
)
from db import inject_conn_pool
from psycopg2.extras import RealDictCursor

etl_name = "process_application_submission_lg_review"
logger = setup_and_get_logger(etl_name)


@inject_conn_pool
def insert_application_submission_review(conn=None, batch_size=BATCH_UPLOAD_SIZE):
    logger.info(f"Start {etl_name}")
    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        with open(
            "applications/submissions/sql/review/app_submission_review_count.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            count_query = sql_file.read()
            cursor.execute(count_query)
            count_total = dict(cursor.fetchone())["count"]
        logger.info(f"Total applications data to insert: {count_total}")

        failed_inserts = 0
        successful_updates_count = 0
        last_application_id = 0

        with open(
            "applications/submissions/sql/review/app_submission_review.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            application_sql = sql_file.read()
            while True:
                cursor.execute(
                    f"""{application_sql} 
                      WHERE olgr.alr_application_id > {last_application_id} ORDER BY olgr.alr_application_id;"""
                )

                rows = cursor.fetchmany(batch_size)

                if not rows:
                    break
                try:
                    records_to_be_inserted_count = len(rows)

                    _insert_records(conn, cursor, rows)

                    successful_updates_count = (
                        successful_updates_count + records_to_be_inserted_count
                    )

                    last_record = dict(rows[-1])
                    last_application_id = last_record["alr_application_id"]

                    logger.debug(
                        f"retrieved/updated items count: {records_to_be_inserted_count}; total successfully insert applications reviews so far {successful_updates_count}; last updated {last_application_id}"
                    )
                except Exception as err:
                    logger.exception(err)
                    conn.rollback()
                    failed_inserts = count_total - successful_updates_count
                    last_application_id = last_application_id + 1

    logger.info(
        f"Finished {etl_name}: total amount of successful inserts {successful_updates_count}, total failed inserts {failed_inserts}"
    )


def _insert_records(conn, cursor, rows):
    number_of_rows_to_insert = len(rows)

    if number_of_rows_to_insert > 0:
        insert_query = _compile_review_insert_query(number_of_rows_to_insert)
        rows_to_insert = _prepare_data_to_insert(rows)
        cursor.execute(insert_query, rows_to_insert)
        conn.commit()


def _compile_review_insert_query(number_of_rows_to_insert):
    reviews_to_insert = ",".join(["%s"] * number_of_rows_to_insert)
    return f"""
                        INSERT INTO alcs.application_submission_review(
                            first_name, 
                            last_name,
                            department, 
                            position, 
                            email, 
                            phone_number, 
                            is_ocp_designation, 
                            ocp_bylaw_name,
                            ocp_designation,
                            ocp_consistent,
                            is_subject_to_zoning,
                            zoning_bylaw_name,
                            zoning_designation,
                            zoning_minimum_lot_size,
                            is_zoning_consistent,
                            application_file_number,
                            local_government_file_number,
                            audit_created_by,
                            is_authorized
                        )
                        VALUES{reviews_to_insert}
                        ON CONFLICT DO NOTHING;
    """


def _prepare_data_to_insert(rows):
    row_without_last_element = []
    for row in rows:
        mapped_row = _map_data(row)
        row_without_last_element.append(tuple(mapped_row.values()))

    return row_without_last_element


def _map_data(row):
    return {
        "first_name": row["first_name"],
        "last_name": row["last_name"],
        "department": row["contact_department"],
        "position": row["title"],
        "email": row["email_address"],
        "phone_number": row["phone_number"],
        "is_ocp_designation": _map_ocp_designation(row),
        "ocp_bylaw_name": row["community_pln_bylaw_name"],
        "ocp_designation": row["community_pln_designation"],
        "ocp_consistent": _map_ocp_consistency(row),
        "is_subject_to_zoning": _map_zoning(row),
        "zoning_bylaw_name": row["zoning_bylaw_name"],
        "zoning_designation": row["zoning_designation"],
        "zoning_minimum_lot_size": row["minimum_lot_hectares"],
        "is_zoning_consistent": _map_zoning_consistency(row),
        "application_file_number": row["alr_application_id"],
        "local_government_file_number": row["local_gov_file_number"],
        "audit_created_by": OATS_ETL_USER,
        "is_authorized": _map_is_authorized(row),
    }


def _map_ocp_designation(row):
    if row["community_pln_compliance_ind"] == "X":
        return False
    elif row["community_pln_compliance_ind"] == "N":
        return True
    else:
        return None


def _map_ocp_consistency(row):
    if row["community_pln_compliance_ind"] == "N":
        return False
    elif row["community_pln_compliance_ind"] == "Y":
        return True
    else:
        return None


def _map_zoning(row):
    if row["zoning_compliance_ind"] == "X":
        return False
    elif row["zoning_compliance_ind"] == "N":
        return True
    else:
        return None


def _map_zoning_consistency(row):
    if row["zoning_compliance_ind"] == "N":
        return False
    elif row["zoning_compliance_ind"] == "Y":
        return True
    else:
        return None


def _map_is_authorized(row):
    """
    LRF - Local Government Refused to Forward
    SAL - Submitted to ALC
    """
    if row["accomplishment_code"] == "LRF":
        return False
    elif row["accomplishment_code"] == "SAL":
        return True
    else:
        return None


@inject_conn_pool
def clean_reviews(conn=None):
    logger.info("Start application review cleaning")
    with conn.cursor() as cursor:
        cursor.execute(
            f"DELETE FROM alcs.application_submission_review asr WHERE asr.audit_created_by = '{OATS_ETL_USER}'"
        )
        logger.info(f"Deleted items count = {cursor.rowcount}")
    conn.commit()
    logger.info("Done application review cleaning")
