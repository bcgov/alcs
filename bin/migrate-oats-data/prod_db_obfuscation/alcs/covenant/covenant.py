from common import setup_and_get_logger
from db import inject_conn_pool
from ...utils import log_process, get_update_column_query
from faker import Faker

logger = setup_and_get_logger("prod_data_obfuscation")


def obfuscate_covenant_related_data():
    _update_covenant
    _update_covenant_transferee()


@log_process(logger, "update_with_random_alcs_covenant_transferee")
@inject_conn_pool
def _update_covenant_transferee(conn=None):
    fake = Faker()

    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT uuid FROM alcs.covenant_transferee")
            record_ids = cursor.fetchall()

            for r_id in record_ids:
                sql_query = f"""
                            UPDATE alcs.covenant_transferee
                            SET 
                                {get_update_column_query("first_name")},
                                {get_update_column_query("last_name")},
                                {get_update_column_query("organization_name")},
                                {get_update_column_query("phone_number")},
                                {get_update_column_query("email")}
                            WHERE uuid = %s;
                """
                cursor.execute(
                    sql_query,
                    (
                        fake.first_name(),
                        fake.last_name(),
                        fake.company(),
                        fake.phone_number(),
                        "11@11",
                        r_id[0],
                    ),
                )

            conn.commit()
    except Exception as err:
        conn.rollback()
        logger.exception(err)


@log_process(logger, "update_with_random_alcs_covenant")
@inject_conn_pool
def _update_covenant(conn=None):
    # Set Faker for generating random names
    fake = Faker()

    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT uuid FROM alcs.covenant")
            record_ids = cursor.fetchall()

            for r_id in record_ids:
                sql_query = f"""
                            UPDATE alcs.covenant 
                            SET {get_update_column_query("applicant")},
                            WHERE uuid = %s;
                """
                cursor.execute(
                    sql_query,
                    (
                        fake.name(),
                        r_id[0],
                    ),
                )

            conn.commit()
    except Exception as err:
        conn.rollback()
        logger.exception(err)
