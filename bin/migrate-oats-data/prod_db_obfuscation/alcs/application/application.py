from common import setup_and_get_logger
from db import inject_conn_pool
from ...utils import log_process, lorem_ipsum_function_query
from faker import Faker

logger = setup_and_get_logger("prod_data_obfuscation")


def obfuscate_application_related_data():
    _update_application()
    # _update_application_decision()
    _update_application_decision_component()
    _update_application_owner()


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


# TODO: this should be covered by generic obfuscation
# @log_process(logger, "update_with_random_alcs_application_decision")
# @inject_conn_pool
# def _update_application_decision(conn=None):
#     fake_latin = Faker("la")

#     try:
#         with conn.cursor() as cursor:
#             cursor.execute("SELECT uuid FROM alcs.application_decision")
#             record_ids = cursor.fetchall()

#             for r_id in record_ids:
#                 sql_query = """
#                             UPDATE alcs.application_decision
#                             SET decision_description = CASE WHEN decision_description IS NOT NULL THEN %s ELSE decision_description END,
#                                 rescinded_comment = CASE WHEN rescinded_comment IS NOT NULL THEN %s ELSE rescinded_comment END
#                             WHERE uuid = %s;
#                 """
#                 cursor.execute(
#                     sql_query,
#                     (
#                         fake_latin.sentence(nb_words=10),
#                         fake_latin.sentence(nb_words=5),
#                         r_id[0],
#                     ),
#                 )

#             conn.commit()
#     except Exception as err:
#         conn.rollback()
#         logger.exception(err)


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
