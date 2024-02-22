from common import setup_and_get_logger
from db import inject_conn_pool
from ...utils import log_process, get_update_column_query
from faker import Faker

logger = setup_and_get_logger("prod_data_obfuscation")


def obfuscate_application_related_data():
    _update_application()
    _update_application_decision_component()
    _update_application_owner()
    _update_application_parcel()
    _update_application_submission()
    _update_application_submission_review()


@log_process(logger, "update_with_random_alcs_applications")
@inject_conn_pool
def _update_application(conn=None):
    fake = Faker()
    fake_latin = Faker("la")

    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT uuid FROM alcs.application")
            record_ids = cursor.fetchall()

            for r_id in record_ids:
                sql_query = f"""
                            UPDATE alcs.application 
                            SET 
                            {get_update_column_query("summary")},
                            {get_update_column_query("ag_cap_consultant")},
                            {get_update_column_query("staff_observations")},
                            {get_update_column_query("ag_cap_map")},
                            {get_update_column_query("applicant")}
                            WHERE uuid = %s;
                """
                cursor.execute(
                    sql_query,
                    (
                        fake_latin.sentence(nb_words=10),
                        fake.name(),
                        fake_latin.sentence(nb_words=5),
                        fake_latin.sentence(nb_words=3),
                        fake.name(),
                        r_id[0],
                    ),
                )

            conn.commit()
    except Exception as err:
        conn.rollback()
        logger.exception(err)


@log_process(logger, "update_with_random_alcs_application_decision_component")
@inject_conn_pool
def _update_application_decision_component(conn=None):
    fake = Faker()
    fake_latin = Faker("la")

    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT uuid FROM alcs.application_decision_component")
            record_ids = cursor.fetchall()

            for r_id in record_ids:
                sql_query = f"""
                            UPDATE alcs.application_decision_component 
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


@log_process(logger, "update_with_random_alcs_application_owner")
@inject_conn_pool
def _update_application_owner(conn=None):
    fake = Faker()

    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT uuid FROM alcs.application_owner")
            record_ids = cursor.fetchall()

            for r_id in record_ids:
                sql_query = f"""
                            UPDATE alcs.application_owner 
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


@log_process(logger, "update_with_random_alcs_application_parcel")
@inject_conn_pool
def _update_application_parcel(conn=None):
    fake = Faker()

    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT uuid FROM alcs.application_parcel")
            record_ids = cursor.fetchall()

            for r_id in record_ids:
                sql_query = f"""
                            UPDATE alcs.application_parcel 
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


@log_process(logger, "update_with_random_alcs_application_submission")
@inject_conn_pool
def _update_application_submission(conn=None):
    fake = Faker()
    fake_latin = Faker("la")

    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT uuid FROM alcs.application_submission")
            record_ids = cursor.fetchall()

            for r_id in record_ids:
                sql_query = f"""
                            UPDATE alcs.application_submission 
                            SET 
                            {get_update_column_query("applicant")},
                            {get_update_column_query("nfu_outside_lands")},
                            {get_update_column_query("nfu_agriculture_support")},
                            {get_update_column_query("tur_agricultural_activities")},
                            {get_update_column_query("tur_reduce_negative_impacts")},
                            {get_update_column_query("tur_outside_lands")},
                            {get_update_column_query("subd_suitability")},
                            {get_update_column_query("subd_agriculture_support")},
                            {get_update_column_query("soil_type_removed")},
                            {get_update_column_query("soil_reduce_negative_impacts")},
                            {get_update_column_query("soil_fill_type_to_place")},
                            {get_update_column_query("soil_alternative_measures")},
                            {get_update_column_query("naru_residence_necessity")},
                            {get_update_column_query("naru_location_rationale")},
                            {get_update_column_query("naru_infrastructure")},
                            {get_update_column_query("naru_existing_structures")},
                            {get_update_column_query("naru_fill_type")},
                            {get_update_column_query("naru_fill_origin")},
                            {get_update_column_query("naru_agri_tourism")},
                            {get_update_column_query("purpose")},
                            {get_update_column_query("prescribed_body")},
                            {get_update_column_query("excl_why_land")},
                            {get_update_column_query("incl_agriculture_support")},
                            {get_update_column_query("incl_improvements")},
                            {get_update_column_query("cove_farm_impact")}
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
                        fake_latin.sentence(nb_words=2),
                        fake_latin.sentence(nb_words=2),
                        fake_latin.sentence(nb_words=2),
                        fake_latin.sentence(nb_words=2),
                        fake_latin.sentence(nb_words=2),
                        fake_latin.sentence(nb_words=2),
                        fake_latin.sentence(nb_words=2),
                        fake_latin.sentence(nb_words=2),
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


@log_process(logger, "update_with_random_alcs_application_submission_review")
@inject_conn_pool
def _update_application_submission_review(conn=None):
    fake = Faker()
    fake_latin = Faker("la")

    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT uuid FROM alcs.application_submission_review")
            record_ids = cursor.fetchall()

            for r_id in record_ids:
                sql_query = f"""
                            UPDATE alcs.application_submission_review 
                            SET 
                                {get_update_column_query("first_name")},
                                {get_update_column_query("last_name")},
                                {get_update_column_query("position")},
                                {get_update_column_query("department")},
                                {get_update_column_query("phone_number")},
                                {get_update_column_query("email")},
                                {get_update_column_query("ocp_bylaw_name")},
                                {get_update_column_query("ocp_designation")},
                                {get_update_column_query("zoning_bylaw_name")},
                                {get_update_column_query("zoning_designation")},
                                {get_update_column_query("zoning_minimum_lot_size")}
                            WHERE uuid = %s;
                """
                cursor.execute(
                    sql_query,
                    (
                        fake.first_name(),
                        fake.last_name(),
                        fake.job(),
                        fake.bs(),
                        fake.phone_number(),
                        fake.email(),
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
