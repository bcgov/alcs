from common import setup_and_get_logger
from db import inject_conn_pool
from ...utils import log_process, get_update_column_query
from faker import Faker

logger = setup_and_get_logger("prod_data_obfuscation")


def obfuscate_inquiry_related_data():
    _update_inquiries_summary()
    _update_inquiries_first_name()
    _update_inquiries_last_name()
    _update_inquiries_organization()
    _update_inquiries_email()
    _update_inquiries_phone()
    _update_inquiry_parcel()


@log_process(logger, "update_with_random_alcs_inquiries")
@inject_conn_pool
def _update_inquiries_summary(conn=None):
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
                            {get_update_column_query("summary")}
                            WHERE uuid = %s AND summary IS NOT NULL;
                """
                cursor.execute(
                    sql_query,
                    (
                        fake_latin.sentence(nb_words=10),
                        r_id[0],
                    ),
                )

            conn.commit()
    except Exception as err:
        conn.rollback()
        logger.exception(err)


@log_process(logger, "update_with_random_alcs_inquiries")
@inject_conn_pool
def _update_inquiries_first_name(conn=None):
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
                            {get_update_column_query("inquirer_first_name")}
                            WHERE uuid = %s AND inquirer_first_name IS NOT NULL;
                """
                cursor.execute(
                    sql_query,
                    (
                        fake.first_name(),
                        r_id[0],
                    ),
                )

            conn.commit()
    except Exception as err:
        conn.rollback()
        logger.exception(err)


@log_process(logger, "update_with_random_alcs_inquiries")
@inject_conn_pool
def _update_inquiries_last_name(conn=None):
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
                            {get_update_column_query("inquirer_last_name")}
                            WHERE uuid = %s AND inquirer_last_name IS NOT NULL;
                """
                cursor.execute(
                    sql_query,
                    (
                        fake.last_name(),
                        r_id[0],
                    ),
                )

            conn.commit()
    except Exception as err:
        conn.rollback()
        logger.exception(err)


@log_process(logger, "update_with_random_alcs_inquiries")
@inject_conn_pool
def _update_inquiries_organization(conn=None):
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
                            {get_update_column_query("inquirer_organization")}
                            WHERE uuid = %s AND inquirer_organization IS NOT NULL;
                """
                cursor.execute(
                    sql_query,
                    (
                        fake.company(),
                        r_id[0],
                    ),
                )

            conn.commit()
    except Exception as err:
        conn.rollback()
        logger.exception(err)


@log_process(logger, "update_with_random_alcs_inquiries")
@inject_conn_pool
def _update_inquiries_phone(conn=None):
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
                            {get_update_column_query("inquirer_phone")}
                            WHERE uuid = %s AND inquirer_phone IS NOT NULL;
                """
                cursor.execute(
                    sql_query,
                    (
                        fake.phone_number(),
                        r_id[0],
                    ),
                )

            conn.commit()
    except Exception as err:
        conn.rollback()
        logger.exception(err)


@log_process(logger, "update_with_random_alcs_inquiries")
@inject_conn_pool
def _update_inquiries_email(conn=None):
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
                            {get_update_column_query("inquirer_email")}
                            WHERE uuid = %s AND inquirer_email IS NOT NULL;
                """
                cursor.execute(
                    sql_query,
                    (
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
                            WHERE uuid = %s AND civic_address IS NOT NULL;
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
