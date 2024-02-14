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
                sql_query = """
                            UPDATE alcs.application 
                            SET summary = CASE WHEN summary IS NOT NULL THEN %s ELSE summary END, 
                                ag_cap_consultant = CASE WHEN ag_cap_consultant IS NOT NULL THEN %s ELSE ag_cap_consultant END, 
                                staff_observations = CASE WHEN staff_observations IS NOT NULL THEN %s ELSE staff_observations END,
                                ag_cap = CASE WHEN ag_cap IS NOT NULL THEN %s ELSE ag_cap END,
                                ag_cap_source = CASE WHEN ag_cap_source IS NOT NULL THEN %s ELSE ag_cap_source END,
                                ag_cap_map = CASE WHEN ag_cap_map IS NOT NULL THEN %s ELSE ag_cap_map END,
                                applicant = CASE WHEN applicant IS NOT NULL THEN %s ELSE applicant END
                            WHERE uuid = %s;
                """
                cursor.execute(
                    sql_query,
                    (
                        fake_latin.sentence(nb_words=10),
                        fake.name(),
                        fake_latin.sentence(nb_words=5),
                        fake_latin.sentence(nb_words=3),
                        fake_latin.sentence(nb_words=3),
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

    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT uuid FROM alcs.application_decision_component")
            record_ids = cursor.fetchall()

            for r_id in record_ids:
                sql_query = """
                            UPDATE alcs.application_decision_component 
                            SET ag_cap_consultant = CASE WHEN ag_cap_consultant IS NOT NULL THEN %s ELSE ag_cap_consultant END
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


@log_process(logger, "update_with_random_alcs_application_owner")
@inject_conn_pool
def _update_application_owner(conn=None):
    fake = Faker()

    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT uuid FROM alcs.application_owner")
            record_ids = cursor.fetchall()

            for r_id in record_ids:
                sql_query = """
                            UPDATE alcs.application_owner 
                            SET first_name = CASE WHEN first_name IS NOT NULL THEN %s ELSE first_name END,
                            last_name = CASE WHEN last_name IS NOT NULL THEN %s ELSE last_name END,
                            organization_name = CASE WHEN organization_name IS NOT NULL THEN %s ELSE organization_name END,
                            phone_number = CASE WHEN organization_name IS NOT NULL THEN %s ELSE organization_name END,
                            email = '11@11'
                            WHERE uuid = %s;
                """
                cursor.execute(
                    sql_query,
                    (
                        fake.first_name(),
                        fake.last_name(),
                        fake.company(),
                        fake.phone_number(),
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
                sql_query = """
                            UPDATE alcs.application_parcel 
                            SET civic_address = CASE WHEN civic_address IS NOT NULL THEN %s ELSE civic_address END
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
