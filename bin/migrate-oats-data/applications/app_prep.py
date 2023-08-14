from common import (
    ALRChangeCode,
    AlcsNfuTypeCode,
    AlcsNfuSubTypeCode,
    OatsCapabilitySourceCode,
    OatsAgriCapabilityCodes,
    OATS_NFU_SUBTYPES,
    AlcsAgCap,
    AlcsAgCapSource,
    log_end,
    log_start,
    OatsLegislationCodes,
    AlcsApplicantType,
)
from db import inject_conn_pool
from constants import BATCH_UPLOAD_SIZE
from psycopg2.extras import execute_batch, RealDictCursor
import traceback
from enum import Enum


etl_name = "alcs_app_prep"


class OatsToAlcsNfuTypes(Enum):
    AGR = AlcsNfuTypeCode.Agricultural_Farm.value
    CIV = AlcsNfuTypeCode.Civic_Institutional.value
    COM = AlcsNfuTypeCode.Commercial_Retail.value
    IND = AlcsNfuTypeCode.Industrial.value
    OTH = AlcsNfuTypeCode.Other.value
    REC = AlcsNfuTypeCode.Recreational.value
    RES = AlcsNfuTypeCode.Residential.value
    TRA = AlcsNfuTypeCode.Transportation_Utilities.value
    UNU = AlcsNfuTypeCode.Unused.value


class OatsToAlcsAgCapSource(Enum):
    BCLI = AlcsAgCapSource.BCLI.value
    CLI = AlcsAgCapSource.CLI.value
    ONSI = AlcsAgCapSource.On_site.value


class OatsToAlcsAgCap(Enum):
    P = AlcsAgCap.Prime.value
    PD = AlcsAgCap.Prime_Dominant.value
    MIX = AlcsAgCap.Mixed_Prime_Secondary.value
    S = AlcsAgCap.Secondary.value
    U = AlcsAgCap.Unclassified.value

class OatsLegislationCodes(Enum):
    SEC_30_1 = AlcsApplicantType.Land_owner.value
    SEC_29_1 = AlcsApplicantType.LFNG.value
    SEC_17_3 = AlcsApplicantType.Land_owner.value
    SEC_17_1 = AlcsApplicantType.LFNG.value

@inject_conn_pool
def process_alcs_application_prep_fields(conn=None, batch_size=BATCH_UPLOAD_SIZE):
    """
    This function is responsible for processing applications in batches, updating records in the alcs.application table.

    Args:
    conn (psycopg2.extensions.connection): PostgreSQL database connection. Provided by the decorator.
    batch_size (int): The number of items to process at once. Defaults to BATCH_UPLOAD_SIZE.
    """

    log_start(etl_name)
    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        with open(
            "applications/sql/application-prep/application_prep.count.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            count_query = sql_file.read()
            cursor.execute(count_query)
            count_total = dict(cursor.fetchone())["count"]
        print("- Total Application Prep data to insert: ", count_total)

        failed_inserts = 0
        successful_updates_count = 0
        last_application_id = 0

        with open(
            "applications/sql/application-prep/application_prep.sql",
            "r",
            encoding="utf-8",
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

                    update_app_prep_records(conn, batch_size, cursor, rows)

                    successful_updates_count = (
                        successful_updates_count + applications_to_be_updated_count
                    )
                    last_application_id = dict(rows[-1])["alr_application_id"]

                    print(
                        f"retrieved/updated items count: {applications_to_be_updated_count}; total successfully updated applications so far {successful_updates_count}; last updated application_id: {last_application_id}"
                    )
                except Exception as e:
                    # this is NOT going to be caused by actual data update failure. This code is only executed when the code error appears or connection to DB is lost
                    conn.rollback()
                    str_err = str(e)
                    trace_err = traceback.format_exc()
                    print(str_err)
                    print(trace_err)
                    log_end(etl_name, str_err, trace_err)
                    failed_inserts = count_total - successful_updates_count
                    last_application_id = last_application_id + 1

    print("Total amount of successful updates:", successful_updates_count)
    print("Total failed updates:", failed_inserts)
    log_end(etl_name)


def update_app_prep_records(conn, batch_size, cursor, rows):
    """
    Function to update application records in batches.

    Args:
    conn (obj): Connection to the database.
    batch_size (int): Number of rows to execute at one time.
    cursor (obj): Cursor object to execute queries.
    rows (list): Rows of data to update in the database.

    Returns:
    None: Commits the changes to the database.
    """
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
            inc_data_list,
            page_size=batch_size,
        )

    if len(other_data_list) > 0:
        execute_batch(
            cursor,
            get_update_query_for_other(),
            other_data_list,
            page_size=batch_size,
        )

    conn.commit()


def prepare_app_prep_data(app_prep_raw_data_list):
    """
    This function prepares different lists of data based on the 'alr_change_code' field of each data dict in 'app_prep_raw_data_list'.

    :param app_prep_raw_data_list: A list of raw data dictionaries.
    :return: Five lists, each containing dictionaries from 'app_prep_raw_data_list' grouped based on the 'alr_change_code' field

    Detailed Workflow:
    - Initializes empty lists
    - Iterates over 'app_prep_raw_data_list'
        - Maps the basic fields of the data dictionary based on the alr_change_code
    - Returns the mapped lists
    """
    nfu_data_list = []
    nar_data_list = []
    exc_data_list = []
    inc_data_list = []
    other_data_list = []

    for row in app_prep_raw_data_list:
        data = dict(row)
        data = map_basic_field(data)

        if data["alr_change_code"] == ALRChangeCode.NFU.value:
            data = mapOatsToAlcsAppPrep(data)
            nfu_data_list.append(data)
        elif data["alr_change_code"] == ALRChangeCode.NAR.value:
            nar_data_list.append(data)
        elif data["alr_change_code"] == ALRChangeCode.EXC.value:
            data = mapOatsToAlcsLegislationCode(data)
            exc_data_list.append(data)
        elif data["alr_change_code"] == ALRChangeCode.INC.value:
            data = mapOatsToAlcsLegislationCode(data)
            inc_data_list.append(data)
        else:
            other_data_list.append(data)

    return nfu_data_list, nar_data_list, other_data_list, exc_data_list, inc_data_list


def mapOatsToAlcsAppPrep(data):
    oats_type_code = data["nonfarm_use_type_code"]
    oats_subtype_code = data["nonfarm_use_subtype_code"]

    if data["nonfarm_use_type_code"]:
        data["nonfarm_use_type_code"] = str(
            OatsToAlcsNfuTypes[data["nonfarm_use_type_code"]].value
        )
    if data["nonfarm_use_subtype_code"]:
        data["nonfarm_use_subtype_code"] = map_oats_to_alcs_nfu_subtypes(
            oats_type_code, oats_subtype_code
        )

    return data

def mapOatsToAlcsLegislationCode(data):

    if data["legislation_code"]:
        data["legislation_code"] = str(
            OatsLegislationCodes[data["legislation_code"]].value
        )

    return data

def get_update_query(unique_fields):
    # unique_fields takes input from called function and appends to query
    query = """
                UPDATE alcs.application
                SET ag_cap = %(agri_capability_code)s,
                    ag_cap_map = %(agri_cap_map)s,
                    ag_cap_consultant = %(agri_cap_consultant)s,
                    alr_area = %(component_area)s,
                    ag_cap_source = %(capability_source_code)s,
                    staff_observations = %(staff_comment_observations)s,
                    fee_paid_date = %(fee_received_date)s,
                    fee_waived = %(fee_waived_ind)s,
                    fee_amount = %(applied_fee_amt)s,
                    fee_split_with_lg = %(split_fee_with_local_gov_ind)s
                    {unique_fields}
                WHERE
                alcs.application.file_number = %(alr_application_id)s::TEXT;
    """
    return query.format(unique_fields=unique_fields)

def get_update_query_for_nfu():
    unique_fields = """,
            nfu_use_type = %(nonfarm_use_type_code)s,
            nfu_use_sub_type = %(nonfarm_use_subtype_code)s,
            proposal_end_date = %(nonfarm_use_end_date)s"""
    return get_update_query(unique_fields)

def get_update_query_for_nar():
    # naruSubtype is a part of submission, import there
    unique_fields = """,
            proposal_end_date = %(rsdntl_use_end_date)s"""
    return get_update_query(unique_fields)


def get_update_query_for_exc():
    # TODO Will be finalized in ALCS-834.
    # exclsn_app_type_code is out of scope. It is a part of submission
    unique_fields = """,
            incl_excl_applicant_type = %(legislation_code)s"""
    return get_update_query(unique_fields)


def get_update_query_for_inc():
    # TODO Will be finalized in ALCS-834.
    unique_fields = """,
            incl_excl_applicant_type = %(legislation_code)s"""
    return get_update_query(unique_fields)


def get_update_query_for_other():
    # leaving blank insert for now
    unique_fields = """"""
    return get_update_query(unique_fields)

def map_oats_to_alcs_nfu_subtypes(nfu_type_code, nfu_subtype_code):
    for dict_obj in OATS_NFU_SUBTYPES:
        if str(dict_obj["type_key"]) == str(nfu_type_code) and str(
            dict_obj["subtype_key"]
        ) == str(nfu_subtype_code):
            return dict_obj["value"]

    # Return None when no matching key found
    return None


def map_basic_field(data):
    if data["capability_source_code"]:
        data["capability_source_code"] = str(
            OatsToAlcsAgCapSource[data["capability_source_code"]].value
        )
    if data["agri_capability_code"]:
        data["agri_capability_code"] = str(
            OatsToAlcsAgCap[data["agri_capability_code"]].value
        )

    return data
