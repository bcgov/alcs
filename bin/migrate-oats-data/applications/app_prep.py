from common import (
    ALRChangeCode,
    AlcsNfuTypeCode,
    OATS_NFU_SUBTYPES,
    AlcsAgCap,
    AlcsAgCapSource,
    OatsLegislationCodes,
    AlcsApplicantType,
    setup_and_get_logger,
    BATCH_UPLOAD_SIZE,
)
from db import inject_conn_pool
from psycopg2.extras import execute_batch, RealDictCursor
from enum import Enum


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


etl_name = "process_alcs_application_prep_fields"
logger = setup_and_get_logger(etl_name)


@inject_conn_pool
def process_alcs_application_prep_fields(conn=None, batch_size=BATCH_UPLOAD_SIZE):
    """
    This function is responsible for processing applications in batches, updating records in the alcs.application table.

    Args:
    conn (psycopg2.extensions.connection): PostgreSQL database connection. Provided by the decorator.
    batch_size (int): The number of items to process at once. Defaults to BATCH_UPLOAD_SIZE.
    """
    logger.info(f"Start {etl_name}")

    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        with open(
            "applications/sql/application-prep/application_prep.count.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            count_query = sql_file.read()
            cursor.execute(count_query)
            count_total = dict(cursor.fetchone())["count"]
        logger.info(f"Total Application Prep data to insert: {count_total}")

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

                    _update_app_prep_records(conn, batch_size, cursor, rows)

                    successful_updates_count = (
                        successful_updates_count + applications_to_be_updated_count
                    )
                    last_application_id = dict(rows[-1])["alr_application_id"]

                    logger.debug(
                        f"retrieved/updated items count: {applications_to_be_updated_count}; total successfully updated applications so far {successful_updates_count}; last updated application_id: {last_application_id}"
                    )
                except Exception as e:
                    # this is NOT going to be caused by actual data update failure. This code is only executed when the code error appears or connection to DB is lost
                    logger.exception(e)
                    conn.rollback()
                    failed_inserts = count_total - successful_updates_count
                    last_application_id = last_application_id + 1

    logger.info(f"Total amount of successful updates: {successful_updates_count}")
    logger.info(f"Total failed updates: {failed_inserts}")


def _update_app_prep_records(conn, batch_size, cursor, rows):
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
    ) = _prepare_app_prep_data(rows)

    if len(nfu_data_list) > 0:
        execute_batch(
            cursor,
            _get_update_query_for_nfu(),
            nfu_data_list,
            page_size=batch_size,
        )

    if len(nar_data_list) > 0:
        execute_batch(
            cursor,
            _get_update_query_for_nar(),
            nar_data_list,
            page_size=batch_size,
        )

    if len(exc_data_list) > 0:
        execute_batch(
            cursor,
            _get_update_query_for_exc(),
            exc_data_list,
            page_size=batch_size,
        )

    if len(inc_data_list) > 0:
        execute_batch(
            cursor,
            _get_update_query_for_inc(),
            inc_data_list,
            page_size=batch_size,
        )

    if len(other_data_list) > 0:
        execute_batch(
            cursor,
            _get_update_query_for_other(),
            other_data_list,
            page_size=batch_size,
        )

    conn.commit()


def _prepare_app_prep_data(app_prep_raw_data_list):
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
        data = _map_basic_field(data)

        if data["alr_change_code"] == ALRChangeCode.NFU.value:
            data = _mapOatsToAlcsAppPrep(data)
            nfu_data_list.append(data)
        elif data["alr_change_code"] == ALRChangeCode.NAR.value:
            nar_data_list.append(data)
        elif data["alr_change_code"] == ALRChangeCode.EXC.value:
            data = _mapOatsToAlcsLegislationCode(data)
            exc_data_list.append(data)
        elif data["alr_change_code"] == ALRChangeCode.INC.value:
            data = _mapOatsToAlcsLegislationCode(data)
            inc_data_list.append(data)
        else:
            other_data_list.append(data)

    return nfu_data_list, nar_data_list, other_data_list, exc_data_list, inc_data_list


def _mapOatsToAlcsAppPrep(data):
    oats_type_code = data["nonfarm_use_type_code"]
    oats_subtype_code = data["nonfarm_use_subtype_code"]

    if data["nonfarm_use_type_code"]:
        data["nonfarm_use_type_code"] = str(
            OatsToAlcsNfuTypes[data["nonfarm_use_type_code"]].value
        )
    if data["nonfarm_use_subtype_code"]:
        data["nonfarm_use_subtype_code"] = _map_oats_to_alcs_nfu_subtypes(
            oats_type_code, oats_subtype_code
        )

    return data


def _mapOatsToAlcsLegislationCode(data):
    if data["legislation_code"]:
        data["legislation_code"] = str(
            OatsLegislationCodes[data["legislation_code"]].value
        )

    return data


def _get_update_query(unique_fields):
    # unique_fields takes input from called function and appends to query
    query = """
                UPDATE alcs.application
                SET ag_cap = %(agri_capability_code)s,
                    ag_cap_map = %(agri_cap_map)s,
                    ag_cap_consultant = %(agri_cap_consultant)s,
                    alr_area = %(component_area)s,
                    ag_cap_source = %(capability_source_code)s,
                    staff_observations = %(staff_comment_observations)s,
                    fee_paid_date = COALESCE(%(fee_received_date)s, fee_paid_date),
                    fee_waived = %(fee_waived_ind)s,
                    fee_amount = %(applied_fee_amt)s,
                    fee_split_with_lg = %(split_fee_with_local_gov_ind)s,
                    legacy_id = %(legacy_application_nbr)s,
                    date_submitted_to_alc = COALESCE(%(submitted_to_alc_date)s, date_submitted_to_alc)
                    {unique_fields}
                WHERE
                alcs.application.file_number = %(alr_application_id)s::TEXT;
    """
    return query.format(unique_fields=unique_fields)


def _get_update_query_for_nfu():
    unique_fields = """,
            nfu_use_type = %(nonfarm_use_type_code)s,
            nfu_use_sub_type = %(nonfarm_use_subtype_code)s,
            proposal_end_date = %(nonfarm_use_end_date)s"""
    return _get_update_query(unique_fields)


def _get_update_query_for_nar():
    # naruSubtype is a part of submission, import there
    unique_fields = """,
            proposal_end_date = %(rsdntl_use_end_date)s"""
    return _get_update_query(unique_fields)


def _get_update_query_for_exc():
    # exclsn_app_type_code is out of scope. It is a part of submission
    unique_fields = """,
            incl_excl_applicant_type = %(legislation_code)s"""
    return _get_update_query(unique_fields)


def _get_update_query_for_inc():
    unique_fields = """,
            incl_excl_applicant_type = %(legislation_code)s"""
    return _get_update_query(unique_fields)


def _get_update_query_for_other():
    # leaving blank insert for now
    unique_fields = """"""
    return _get_update_query(unique_fields)


def _map_oats_to_alcs_nfu_subtypes(nfu_type_code, nfu_subtype_code):
    for dict_obj in OATS_NFU_SUBTYPES:
        if str(dict_obj["type_key"]) == str(nfu_type_code) and str(
            dict_obj["subtype_key"]
        ) == str(nfu_subtype_code):
            return dict_obj["value"]

    # Return None when no matching key found
    return None


def _map_basic_field(data):
    if data["capability_source_code"]:
        data["capability_source_code"] = str(
            OatsToAlcsAgCapSource[data["capability_source_code"]].value
        )
    if data["agri_capability_code"]:
        data["agri_capability_code"] = str(
            OatsToAlcsAgCap[data["agri_capability_code"]].value
        )

    return data
