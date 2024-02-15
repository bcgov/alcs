from common import setup_and_get_logger
from db import inject_conn_pool
from ...utils import log_process, get_update_column_query
from faker import Faker

logger = setup_and_get_logger("prod_data_obfuscation")


def obfuscate_notification_related_data():
    _update_notifications()
    _update_notification_parcel()
    _update_notification_submission()
    _update_notification_transferee()


@log_process(logger, "update_with_random_alcs_notifications")
@inject_conn_pool
def _update_notifications(conn=None):
    fake = Faker()
    fake_latin = Faker("la")

    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT uuid FROM alcs.notification")
            record_ids = cursor.fetchall()

            for r_id in record_ids:
                sql_query = f"""
                            UPDATE alcs.notification 
                            SET 
                            {get_update_column_query("summary")},
                            {get_update_column_query("staff_observations")},
                            {get_update_column_query("applicant")}
                            WHERE uuid = %s;
                """
                cursor.execute(
                    sql_query,
                    (
                        fake_latin.sentence(nb_words=10),
                        fake_latin.sentence(nb_words=5),
                        fake.name(),
                        r_id[0],
                    ),
                )

            conn.commit()
    except Exception as err:
        conn.rollback()
        logger.exception(err)


@log_process(logger, "update_with_random_alcs_notification_parcel")
@inject_conn_pool
def _update_notification_parcel(conn=None):
    fake = Faker()

    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT uuid FROM alcs.notification_parcel")
            record_ids = cursor.fetchall()

            for r_id in record_ids:
                sql_query = f"""
                            UPDATE alcs.notification_parcel 
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


@log_process(logger, "update_with_random_alcs_notification_submission")
@inject_conn_pool
def _update_notification_submission(conn=None):
    fake = Faker()
    fake_latin = Faker("la")

    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT uuid FROM alcs.notification_submission")
            record_ids = cursor.fetchall()

            for r_id in record_ids:
                sql_query = f"""
                            UPDATE alcs.notification_submission 
                            SET 
                            {get_update_column_query("applicant")},
                            {get_update_column_query("purpose")},
                            {get_update_column_query("contact_first_name")},
                            {get_update_column_query("contact_last_name")},
                            {get_update_column_query("contact_organization")},
                            {get_update_column_query("contact_phone")},
                            {get_update_column_query("contact_email")}
                            WHERE uuid = %s;
                """

                cursor.execute(
                    sql_query,
                    (
                        fake.name(),
                        fake_latin.sentence(nb_words=5),
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


@log_process(logger, "update_with_random_alcs_notification_transferee")
@inject_conn_pool
def _update_notification_transferee(conn=None):
    fake = Faker()

    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT uuid FROM alcs.notification_transferee")
            record_ids = cursor.fetchall()

            for r_id in record_ids:
                sql_query = f"""
                            UPDATE alcs.notification_transferee
                            SET 
                            {get_update_column_query("first_name")},
                            {get_update_column_query("last_name")},
                            {get_update_column_query("phone_number")},
                            {get_update_column_query("email")}
                            WHERE uuid = %s;
                """
                cursor.execute(
                    sql_query,
                    (
                        fake.first_name(),
                        fake.last_name(),
                        fake.phone_number(),
                        "11@11",
                        r_id[0],
                    ),
                )

            conn.commit()
    except Exception as err:
        conn.rollback()
        logger.exception(err)
