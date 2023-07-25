from alcs_application_enum import AlcsNfuTypeCode, AlcsNfuSubTypeCode
from common import ALRChangeCode
from db import inject_conn_pool
from constants import BATCH_UPLOAD_SIZE
from psycopg2.extras import execute_batch, RealDictCursor
import traceback
from enum import Enum


@inject_conn_pool
def process_application_details(conn=None, batch_size=1000):
    """"""


@inject_conn_pool
def process_alcs_application_prep_fields(conn=None, batch_size=10):
    """"""
    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        with open(
            "applications/sql/application_prep.count.sql", "r", encoding="utf-8"
        ) as sql_file:
            count_query = sql_file.read()
            cursor.execute(count_query)
            count_total = dict(cursor.fetchone())["count"]
        print("- Total Application Prep data to insert: ", count_total)

        failed_inserts = 0
        successful_updates_count = 0
        last_application_id = 0

        with open(
            "applications/sql/application_prep.sql", "r", encoding="utf-8"
        ) as sql_file:
            application_sql = sql_file.read()
            while True:
                cursor.execute(
                    f"{application_sql} WHERE acg.alr_application_id > {last_application_id} ORDER BY acg.alr_application_id;"
                )

                rows = cursor.fetchmany(batch_size)
                if not rows:
                    break
                try:
                    applications_to_be_updated_count = len(rows)

                    (
                        nfu_data_list,
                        nar_data_list,
                        other_data_list,
                        exc_data_list,
                        inc_data_list,
                    ) = prepare_app_prep_data(rows)

                    if len(nfu_data_list) > 0:
                        execute_batch(
                            cursor,
                            get_update_query_for_nfu(),
                            nfu_data_list,
                            page_size=batch_size,
                        )

                    if len(nar_data_list) > 0:
                        execute_batch(
                            cursor,
                            get_update_query_for_nar(),
                            nar_data_list,
                            page_size=batch_size,
                        )

                    if len(exc_data_list) > 0:
                        execute_batch(
                            cursor,
                            get_update_query_for_exc(),
                            exc_data_list,
                            page_size=batch_size,
                        )

                    if len(inc_data_list) > 0:
                        execute_batch(
                            cursor,
                            get_update_query_for_inc(),
                            exc_data_list,
                            page_size=batch_size,
                        )

                    if len(other_data_list) > 0:
                        execute_batch(
                            cursor,
                            get_update_query_for_other(),
                            other_data_list,
                            page_size=batch_size,
                        )

                    # Since update does not fail there will be a separate script that will return difference between oats and alcs

                    conn.commit()

                    successful_updates_count = (
                        successful_updates_count + applications_to_be_updated_count
                    )
                    last_application_id = dict(rows[-1])["alr_application_id"]

                    print(
                        f"retrieved/updated items count: {applications_to_be_updated_count}; total successfully updated applications so far {successful_updates_count}; last updated application_id: {last_application_id}"
                    )
                except Exception as e:
                    conn.rollback()
                    print(str(e))
                    print(traceback.format_exc())
                    failed_inserts = count_total - successful_updates_count
                    last_application_id = last_application_id + 1
                    break

    print("Total amount of successful updates:", successful_updates_count)
    print("Total failed updates:", failed_inserts)


def prepare_app_prep_data(app_prep_raw_data_list):
    """
    1. sort records based on application type.
    2. build different update queries based on the type and use arrays as input
    """

    nfu_data_list = []
    nar_data_list = []
    exc_data_list = []
    other_data_list = []
    inc_data_list = []

    for row in app_prep_raw_data_list:
        data = dict(row)
        if data["alr_change_code"] == ALRChangeCode.NFU:
            data = mapOatsToAlcsAppPrep(data)
            nfu_data_list.append(data)
        elif data["alr_change_code"] == ALRChangeCode.NAR:
            nar_data_list.append(data)
        elif data["alr_change_code"] == ALRChangeCode.EXC:
            exc_data_list.append(data)
        elif data["alr_change_code"] == ALRChangeCode.INC:
            inc_data_list.append(data)
        else:
            other_data_list.append(data)

    return nfu_data_list, nar_data_list, other_data_list


def mapOatsToAlcsAppPrep(data):
    if data["nonfarm_use_type_code"]:
        data["nonfarm_use_type_code"] = OatsToAlcsNfuTypes[
            data["nonfarm_use_type_code"]
        ].value
    if data["nonfarm_use_subtype_code"]:
        data["nonfarm_use_subtype_code"] = mapOatsToAlcsNfuSubTypes(
            data["nonfarm_use_subtype_code"]
        )
    return data


def get_update_query_for_nfu():
    query = """
                UPDATE alcs.application
                SET ag_cap = %(agri_capability_code)s,
                    ag_cap_map = %(agri_cap_map)s,
                    ag_cap_consultant = %(agri_cap_consultant)s,
                    alr_area = %(component_area)s,
                    ag_cap_source = %(capability_source_code)s,
                    nfu_use_type = %(nonfarm_use_type_code)s,
                    nfu_use_sub_type = %(nonfarm_use_subtype_code)s,
                    proposal_end_date = %(nonfarm_use_end_date)s,
                    staff_observations = %(staff_comment_observations)s
                WHERE
                alcs.application.file_number = %(alr_application_id)s::text;
    """
    return query


def get_update_query_for_nar():
    # naruSubtype is a part of submission, import there
    query = """
                UPDATE alcs.application
                SET ag_cap = %(agri_capability_code)s,
                    ag_cap_map = %(agri_cap_map)s,
                    ag_cap_consultant = %(agri_cap_consultant)s,
                    alr_area = %(component_area)s,
                    ag_cap_source = %(capability_source_code)s,
                    proposal_end_date = %(rsdntl_use_end_date)s,
                    staff_observations = %(staff_comment_observations)s
                WHERE
                alcs.application.file_number = %(alr_application_id)s::text;
    """
    return query


def get_update_query_for_exc():
    # TODO Will be finalized in ALCS-834.
    # exclsn_app_type_code is out of scope. It is a part of submission

    query = """
                UPDATE alcs.application
                SET ag_cap = %(agri_capability_code)s,
                    ag_cap_map = %(agri_cap_map)s,
                    ag_cap_consultant = %(agri_cap_consultant)s,
                    alr_area = %(component_area)s,
                    ag_cap_source = %(capability_source_code)s,
                    staff_observations = %(staff_comment_observations)s
                    
                WHERE
                alcs.application.file_number = %(alr_application_id)s::text;
    """
    return query


def get_update_query_for_inc():
    # TODO Will be finalized in ALCS-834.
    query = """
                UPDATE alcs.application
                SET ag_cap = %(agri_capability_code)s,
                    ag_cap_map = %(agri_cap_map)s,
                    ag_cap_consultant = %(agri_cap_consultant)s,
                    alr_area = %(component_area)s,
                    ag_cap_source = %(capability_source_code)s,
                    staff_observations = %(staff_comment_observations)s
                    
                WHERE
                alcs.application.file_number = %(alr_application_id)s::text;
    """
    return query


def get_update_query_for_other():
    query = """
                UPDATE alcs.application
                SET ag_cap = %(agri_capability_code)s,
                    ag_cap_map = %(agri_cap_map)s,
                    ag_cap_consultant = %(agri_cap_consultant)s,
                    alr_area = %(component_area)s,
                    ag_cap_source = %(capability_source_code)s,
                    staff_observations = %(staff_comment_observations)s
                WHERE
                alcs.application.file_number = %(alr_application_id)s::text;
    """
    return query


class OatsToAlcsNfuTypes(Enum):
    AGR = AlcsNfuTypeCode.Agricultural_Farm
    CIV = AlcsNfuTypeCode.Civic_Institutional
    COM = AlcsNfuTypeCode.Commercial_Retail
    IND = AlcsNfuTypeCode.Industrial
    OTH = AlcsNfuTypeCode.Other
    REC = AlcsNfuTypeCode.Recreational
    RES = AlcsNfuTypeCode.Residential
    TRA = AlcsNfuTypeCode.Transportation_Utilities
    UNU = AlcsNfuTypeCode.Unused


def mapOatsToAlcsNfuSubTypes(oats_code):
    # TODO this is work in progress and will be finished later
    if oats_code == 1:
        return "Accessory Buildings"
    if oats_code == 2:
        return "Additional Dwelling(s)"
    if oats_code == 3:
        return "Additional Structures for Farm Help"
    if oats_code == 4:
        return "Agricultural Land Use Remnant"
    if oats_code == 5:
        return "Agricultural Lease"
    if oats_code == 6:
        return "Agricultural Subdivision Remnant"

    return ""
