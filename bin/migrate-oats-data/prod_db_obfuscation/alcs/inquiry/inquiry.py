from common import setup_and_get_logger
from db import inject_conn_pool
from ...utils import log_process, get_update_column_query
from faker import Faker

logger = setup_and_get_logger("prod_data_obfuscation")


def obfuscate_inquiry_related_data():
    _update_inquiries()
    _update_inquiry_parcel()


@log_process(logger, "update_with_random_alcs_inquiries")
@inject_conn_pool
def _update_inquiries(conn=None):
    fake = Faker()
    fake_latin = Faker("la")

    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT uuid FROM alcs.inquiry")
            record_ids = cursor.fetchall()

            for r_id in record_ids:
                sql_query = f"""
                            UPDATE alcs.inquiry 
                            SET 
                            {get_update_column_query("summary")},
                            {get_update_column_query("inquirer_first_name")},
                            {get_update_column_query("inquirer_last_name")},
                            {get_update_column_query("inquirer_organization")},
                            {get_update_column_query("inquirer_phone")},
                            {get_update_column_query("inquirer_email")}
                            WHERE uuid = %s;
                """
                cursor.execute(
                    sql_query,
                    (
                        fake_latin.sentence(nb_words=10),
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


@log_process(logger, "update_with_random_alcs_inquiry_parcel")
@inject_conn_pool
def _update_inquiry_parcel(conn=None):
    fake = Faker()

    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT uuid FROM alcs.inquiry_parcel")
            record_ids = cursor.fetchall()

            for r_id in record_ids:
                sql_query = f"""
                            UPDATE alcs.inquiry_parcel 
                            SET {get_update_column_query("civic_address")}
                            WHERE uuid = %s;
                """
                cursor.execute(
                    sql_query,
                    (
                        fake.address(),
                        r_id[0],
                    ),
                )

            conn.commit()
    except Exception as err:
        conn.rollback()
        logger.exception(err)
