import traceback
from common import (
    OATS_ETL_USER,
    NO_DATA_IN_OATS,
    log,
    log_start,
    AlcsAdjacentLandUseType,
)
from db import inject_conn_pool
from psycopg2.extras import RealDictCursor

etl_name = "process_notice_of_intent_empty_adjacent_land_use"


@inject_conn_pool
def process_notice_of_intent_empty_adjacent_land_use(conn=None):
    """
    This function is responsible for populating empty adjacent land use data imported from OATS to ALCS in notice_of_intent_submission table.
    It uses default values for north, south, west, east related columns.

    Args:
    conn (psycopg2.extensions.connection): PostgreSQL database connection. Provided by the decorator.
    """

    log_start(etl_name)
    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        with open(
            "noi/sql/notice_of_intent_submission/adjacent_land_use/empty_notice_of_intent_adjacent_land_use_count.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            count_query = sql_file.read()
            cursor.execute(count_query)
            count_total = dict(cursor.fetchone())["count"]
        print(
            "- Total Notice of Intent Submission Empty Adjacent Land use data to update: ",
            count_total,
        )

        successful_updates_count = 0
        last_submission_id = 0

        try:
            cursor.execute(
                _update_query,
                {
                    "description": NO_DATA_IN_OATS,
                    "etl_user": OATS_ETL_USER,
                    "default_type": AlcsAdjacentLandUseType.OTH.value,
                },
            )

            updated_row_count = cursor.rowcount

            print(f"updated items count: {updated_row_count}")
        except Exception as e:
            conn.rollback()
            str_err = str(e)
            trace_err = traceback.format_exc()
            print(str_err)
            print(trace_err)
            failed_updates = count_total - successful_updates_count
            last_submission_id = last_submission_id + 1
            log(
                etl_name,
                str_err,
                trace_err,
            )

    log(etl_name)


_update_query = """
        UPDATE alcs.notice_of_intent_submission
        SET north_land_use_type = COALESCE(north_land_use_type, %(default_type)s),
            south_land_use_type = COALESCE(south_land_use_type, %(default_type)s),
            east_land_use_type = COALESCE(east_land_use_type, %(default_type)s),
            west_land_use_type = COALESCE(west_land_use_type, %(default_type)s),
            north_land_use_type_description = COALESCE(
                north_land_use_type_description,
                %(description)s
            ),
            south_land_use_type_description = COALESCE(
                south_land_use_type_description,
                %(description)s
            ),
            east_land_use_type_description = COALESCE(east_land_use_type_description, %(description)s),
            west_land_use_type_description = COALESCE(west_land_use_type_description, %(description)s)
        WHERE audit_created_by = %(etl_user)s
            AND(
                north_land_use_type IS NULL
                OR south_land_use_type IS NULL
                OR east_land_use_type IS NULL
                OR west_land_use_type IS NULL
                OR north_land_use_type_description IS NULL
                OR south_land_use_type_description IS NULL
                OR east_land_use_type_description IS NULL
                OR west_land_use_type_description IS NULL
            )
    """
