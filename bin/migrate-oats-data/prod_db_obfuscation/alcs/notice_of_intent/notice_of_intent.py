from common import setup_and_get_logger
from db import inject_conn_pool
from ...utils import log_process, get_update_column_query
from faker import Faker

logger = setup_and_get_logger("prod_data_obfuscation")


def obfuscate_notice_of_intent_related_data():
    _update_notice_of_intent()
    _update_notice_of_intent_decision()
    _update_notice_of_intent_decision_component()
    _update_notice_of_intent_owner()
    _update_notice_of_intent_parcel()
    _update_notice_of_intent_submission()


@log_process(logger, "update_with_random_alcs_notice_of_intent")
@inject_conn_pool
def _update_notice_of_intent(conn=None):
    # Set Faker for generating random names
    fake = Faker()
    fake_latin = Faker("la")

    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT uuid FROM alcs.notice_of_intent")
            record_ids = cursor.fetchall()

            for r_id in record_ids:
                sql_query = """
                            UPDATE alcs.notice_of_intent 
                            SET applicant = CASE WHEN applicant IS NOT NULL THEN %s ELSE applicant END,
                                summary = CASE WHEN summary IS NOT NULL THEN %s ELSE summary END,
                                ag_cap_map = CASE WHEN ag_cap_map IS NOT NULL THEN %s ELSE ag_cap_map END,
                                ag_cap_consultant = CASE WHEN ag_cap_consultant IS NOT NULL THEN %s ELSE ag_cap_consultant END,
                                staff_observations = CASE WHEN staff_observations IS NOT NULL THEN %s ELSE staff_observations END
                            WHERE uuid = %s;
                """
                cursor.execute(
                    sql_query,
                    (
                        fake.name(),
                        fake_latin.sentence(nb_words=10),
                        fake_latin.sentence(nb_words=3),
                        fake.name(),
                        fake_latin.sentence(nb_words=5),
                        r_id[0],
                    ),
                )

            conn.commit()
    except Exception as err:
        conn.rollback()
        logger.exception(err)


@log_process(logger, "update_with_random_alcs_notice_of_intent_decision")
@inject_conn_pool
def _update_notice_of_intent_decision(conn=None):
    # Set Faker for generating random names
    fake = Faker()
    fake_latin = Faker("la")

    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT uuid FROM alcs.notice_of_intent_decision")
            record_ids = cursor.fetchall()

            for r_id in record_ids:
                sql_query = f"""
                            UPDATE alcs.notice_of_intent_decision
                            SET 
                             {get_update_column_query("decision_maker_name")}
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


@log_process(logger, "update_with_random_alcs_notice_of_intent_decision_component")
@inject_conn_pool
def _update_notice_of_intent_decision_component(conn=None):
    # Set Faker for generating random names
    fake = Faker()
    fake_latin = Faker("la")

    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT uuid FROM alcs.notice_of_intent_decision_component")
            record_ids = cursor.fetchall()

            for r_id in record_ids:
                sql_query = f"""
                            UPDATE alcs.notice_of_intent_decision_component 
                            SET 
                             {get_update_column_query("soil_fill_type_to_place")},
                             {get_update_column_query("ag_cap_consultant")},
                             {get_update_column_query("soil_type_removed")}
                            WHERE uuid = %s;
                """
                cursor.execute(
                    sql_query,
                    (
                        fake_latin.sentence(nb_words=2),
                        fake.name(),
                        fake_latin.sentence(nb_words=2),
                        r_id[0],
                    ),
                )

            conn.commit()
    except Exception as err:
        conn.rollback()
        logger.exception(err)


@log_process(logger, "update_with_random_alcs_notice_of_intent_owner")
@inject_conn_pool
def _update_notice_of_intent_owner(conn=None):
    fake = Faker()

    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT uuid FROM alcs.notice_of_intent_owner")
            record_ids = cursor.fetchall()

            for r_id in record_ids:
                sql_query = f"""
                            UPDATE alcs.notice_of_intent_owner
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


@log_process(logger, "update_with_random_alcs_notice_of_intent_parcel")
@inject_conn_pool
def _update_notice_of_intent_parcel(conn=None):
    fake = Faker()

    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT uuid FROM alcs.notice_of_intent_parcel")
            record_ids = cursor.fetchall()

            for r_id in record_ids:
                sql_query = f"""
                            UPDATE alcs.notice_of_intent_parcel 
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


@log_process(logger, "update_with_random_alcs_notice_of_intent_submission")
@inject_conn_pool
def _update_notice_of_intent_submission(conn=None):
    fake = Faker()
    fake_latin = Faker("la")

    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT uuid FROM alcs.notice_of_intent_submission")
            record_ids = cursor.fetchall()

            for r_id in record_ids:
                sql_query = f"""
                            UPDATE alcs.notice_of_intent_submission 
                            SET 
                            {get_update_column_query("applicant")},
                            {get_update_column_query("purpose")},
                            {get_update_column_query("soil_type_removed")},
                            {get_update_column_query("soil_fill_type_to_place")},
                            {get_update_column_query("soil_structure_farm_use_reason")},
                            {get_update_column_query("soil_structure_residential_use_reason")},
                            {get_update_column_query("soil_agri_parcel_activity")},
                            {get_update_column_query("soil_structure_residential_accessory_use_reason")},
                            {get_update_column_query("soil_structure_other_use_reason")},
                            soil_proposed_structures = '[]'
                            WHERE uuid = %s;
                """

                cursor.execute(
                    sql_query,
                    (
                        fake.name(),
                        fake_latin.sentence(nb_words=2),
                        fake_latin.sentence(nb_words=2),
                        fake_latin.sentence(nb_words=2),
                        fake_latin.sentence(nb_words=2),
                        fake_latin.sentence(nb_words=2),
                        fake_latin.sentence(nb_words=2),
                        fake_latin.sentence(nb_words=2),
                        fake_latin.sentence(nb_words=2),
                        r_id[0],
                    ),
                )

            conn.commit()
    except Exception as err:
        conn.rollback()
        logger.exception(err)
