from common import (
    ALRChangeCode,
    AlcsNfuTypeCode,
    AlcsNfuSubTypeCode,
    OatsCapabilitySourceCode,
    OatsAgriCapabilityCodes,
    AlcsAgCap,
    AlcsAgCapSource,
    log_end,
    log_start,
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
            exc_data_list.append(data)
        elif data["alr_change_code"] == ALRChangeCode.INC.value:
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


def get_nfu_subtype_by_key(list_of_dicts, nfu_type_code, nfu_subtype_code):
    for dict_obj in list_of_dicts:
        if str(dict_obj["type_key"]) == str(nfu_type_code) and str(
            dict_obj["subtype_key"]
        ) == str(nfu_subtype_code):
            return dict_obj["value"]

    # Return None when no matching key found
    return None


def map_oats_to_alcs_nfu_subtypes(nfu_type_code, nfu_subtype_code):
    nfu_subtypes = [
        {"type_key": "AGR", "subtype_key": "1", "value": "Accessory Buildings"},
        {"type_key": "RES", "subtype_key": "2", "value": "Additional Dwelling(s)"},
        {
            "type_key": "AGR",
            "subtype_key": "3",
            "value": "Additional Structures for Farm Help",
        },
        {
            "type_key": "AGR",
            "subtype_key": "4",
            "value": "Agricultural Land Use Remnant",
        },
        {"type_key": "AGR", "subtype_key": "5", "value": "Agricultural Lease"},
        {
            "type_key": "AGR",
            "subtype_key": "6",
            "value": "Agricultural Subdivision Remnant",
        },
        {
            "type_key": "TRA",
            "subtype_key": "7",
            "value": "Airports and Aviation related",
        },
        {"type_key": "IND", "subtype_key": "8", "value": "Alcohol Processing"},
        {
            "type_key": "COM",
            "subtype_key": "9",
            "value": "Animal Boarding and Services",
        },
        {"type_key": "COM", "subtype_key": "11", "value": "Auto Services"},
        {"type_key": "AGR", "subtype_key": "12", "value": "Beef"},
        {
            "type_key": "COM",
            "subtype_key": "13",
            "value": "Campground (Private) & RV Park",
        },
        {"type_key": "COM", "subtype_key": "14", "value": "Care Facilities"},
        {
            "type_key": "IND",
            "subtype_key": "15",
            "value": "Cement/ Asphalt/Concrete Plants",
        },
        {"type_key": "CIV", "subtype_key": "16", "value": "Cemeteries"},
        {"type_key": "CIV", "subtype_key": "17", "value": "Churches & Bible Schools"},
        {"type_key": "CIV", "subtype_key": "18", "value": "Civic - other"},
        {
            "type_key": "CIV",
            "subtype_key": "19",
            "value": "Civic Facilities and Buildings",
        },
        {"type_key": "COM", "subtype_key": "20", "value": "Commercial - other"},
        {"type_key": "IND", "subtype_key": "21", "value": "Composting"},
        {"type_key": "AGR", "subtype_key": "22", "value": "Dairy"},
        {
            "type_key": "IND",
            "subtype_key": "23",
            "value": "Deposition/Fill (All Types)",
        },
        {"type_key": "COM", "subtype_key": "24", "value": "Golf Course"},
        {"type_key": "AGR", "subtype_key": "25", "value": "Grain & Forage"},
        {
            "type_key": "TRA",
            "subtype_key": "25",
            "value": "Electrical Power Distribution Systems",
        },
        {"type_key": "AGR", "subtype_key": "26", "value": "Greenhouses"},
        {
            "type_key": "TRA",
            "subtype_key": "26",
            "value": "Electrical Power Facilities",
        },
        {"type_key": "COM", "subtype_key": "28", "value": "Exhibitions and Festivals"},
        {
            "type_key": "RES",
            "subtype_key": "29",
            "value": "Subdivision Special Categories",
        },
        {"type_key": "COM", "subtype_key": "30", "value": "Food and Beverage Services"},
        {
            "type_key": "RES",
            "subtype_key": "30",
            "value": "Subdivision Special Categories (Lease)",
        },
        {"type_key": "IND", "subtype_key": "31", "value": "Food Processing (non-meat)"},
        {"type_key": "IND", "subtype_key": "32", "value": "Industrial - other"},
        {"type_key": "AGR", "subtype_key": "33", "value": "Land Use Remnant"},
        {"type_key": "AGR", "subtype_key": "34", "value": "Livestock-Unspecified"},
        {"type_key": "IND", "subtype_key": "35", "value": "Logging Operations"},
        {
            "type_key": "IND",
            "subtype_key": "36",
            "value": "Lumber Manufacturing and Re-manufacturing",
        },
        {
            "type_key": "IND",
            "subtype_key": "37",
            "value": "Meat and Fish Processing (+abattoir)",
        },
        {"type_key": "IND", "subtype_key": "38", "value": "Mining"},
        {"type_key": "AGR", "subtype_key": "39", "value": "Misc. Agricultural Use"},
        {"type_key": "AGR", "subtype_key": "40", "value": "Mixed Ag Uses"},
        {"type_key": "OTH", "subtype_key": "41", "value": "Mixed Uses"},
        {"type_key": "RES", "subtype_key": "42", "value": "Mobile Home Park"},
        {
            "type_key": "RES",
            "subtype_key": "43",
            "value": "Multi Family-Apartments/Condominiums",
        },
        {
            "type_key": "COM",
            "subtype_key": "44",
            "value": "Office Building (Primary Use)",
        },
        {"type_key": "IND", "subtype_key": "45", "value": "Oil and Gas Activities"},
        {"type_key": "OTH", "subtype_key": "46", "value": "Other Uses"},
        {"type_key": "AGR", "subtype_key": "47", "value": "Other-Undefined"},
        {"type_key": "REC", "subtype_key": "48", "value": "Parks & Playing Fields"},
        {
            "type_key": "CIV",
            "subtype_key": "49",
            "value": "Parks-All Types operated by Local Gov't",
        },
        {"type_key": "AGR", "subtype_key": "50", "value": "Pigs/Hogs"},
        {"type_key": "AGR", "subtype_key": "51", "value": "Poultry"},
        {
            "type_key": "TRA",
            "subtype_key": "52",
            "value": "Public Transportation Facilities",
        },
        {"type_key": "TRA", "subtype_key": "53", "value": "Railway"},
        {"type_key": "REC", "subtype_key": "54", "value": "Recreational - other"},
        {"type_key": "CIV", "subtype_key": "55", "value": "Research Facilities"},
        {"type_key": "RES", "subtype_key": "56", "value": "Residential - other"},
        {"type_key": "TRA", "subtype_key": "57", "value": "Roads"},
        {"type_key": "IND", "subtype_key": "58", "value": "Sand & Gravel"},
        {"type_key": "CIV", "subtype_key": "59", "value": "Sanitary Land Fills"},
        {"type_key": "CIV", "subtype_key": "60", "value": "Schools & Universities"},
        {
            "type_key": "TRA",
            "subtype_key": "61",
            "value": "Sewage Treatment Facilities",
        },
        {"type_key": "TRA", "subtype_key": "62", "value": "Sewer Distribution Systems"},
        {"type_key": "COM", "subtype_key": "63", "value": "Shopping Centre"},
        {"type_key": "AGR", "subtype_key": "64", "value": "Small Fruits-Berries"},
        {
            "type_key": "COM",
            "subtype_key": "65",
            "value": "Sports Facilities - commercial",
        },
        {
            "type_key": "REC",
            "subtype_key": "66",
            "value": "Sports Facilities - municipal",
        },
        {"type_key": "COM", "subtype_key": "67", "value": "Storage & Warehouse"},
        {"type_key": "COM", "subtype_key": "68", "value": "Store (Retail - All Types)"},
        {
            "type_key": "TRA",
            "subtype_key": "69",
            "value": "Telephone and Telecommunications",
        },
        {"type_key": "COM", "subtype_key": "70", "value": "Tourist Accommodations"},
        {"type_key": "REC", "subtype_key": "71", "value": "Trails"},
        {"type_key": "TRA", "subtype_key": "72", "value": "Transportation - other"},
        {"type_key": "AGR", "subtype_key": "73", "value": "Tree Fruits"},
        {"type_key": "AGR", "subtype_key": "74", "value": "Turf Farm"},
        {"type_key": "AGR", "subtype_key": "75", "value": "Vegetable & Truck"},
        {
            "type_key": "AGR",
            "subtype_key": "76",
            "value": "Vineyard and Associated Uses",
        },
        {"type_key": "TRA", "subtype_key": "77", "value": "Water Distribution Systems"},
        {
            "type_key": "TRA",
            "subtype_key": "78",
            "value": "Water or Sewer Distribution Systems (inactive)",
        },
        {"type_key": "TRA", "subtype_key": "79", "value": "Water Treatment Facilities"},
        {"type_key": "COM", "subtype_key": "80", "value": "Hall/Lodge (private)_"},
        {
            "type_key": "CIV",
            "subtype_key": "81",
            "value": "Hospitals, Health Centres (Incl Private)",
        },
        {"type_key": "RES", "subtype_key": "82", "value": "Farm Help Accommodation"},
        {
            "type_key": "TRA",
            "subtype_key": "27",
            "value": "Gas and Other Distribution Pipelines",
        },
        {"type_key": "AGR", "subtype_key": "23", "value": "Energy Production"},
        {"type_key": "IND", "subtype_key": "25", "value": "Energy Production"},
        {"type_key": "RES", "subtype_key": "83", "value": "Lease"},
        {
            "type_key": "IND",
            "subtype_key": "86",
            "value": "Storage and Warehouse Facilities (Indoor/Outdoor- Large Scale Structures)",
        },
        {
            "type_key": "IND",
            "subtype_key": "84",
            "value": "Work Camps or Associated Use",
        },
        {"type_key": "IND", "subtype_key": "85", "value": "Miscellaneous Processing"},
        {"type_key": "COM", "subtype_key": "87", "value": "Events"},
        {"type_key": "IND", "subtype_key": "88", "value": "Sawmill"},
        {
            "type_key": "CIV",
            "subtype_key": "89",
            "value": "Fire Hall and associated uses",
        },
        {
            "type_key": "AGR",
            "subtype_key": "90",
            "value": "Alcohol Production Associated Uses",
        },
        {"type_key": "AGR", "subtype_key": "91", "value": "Cannabis Related Uses"},
    ]

    return get_nfu_subtype_by_key(nfu_subtypes, nfu_type_code, nfu_subtype_code)


def map_basic_field(data):
    if data["capability_source_code"]:
        data["capability_source_code"] = data["capability_source_code"] = str(
            OatsToAlcsAgCapSource[data["capability_source_code"]].value
        )
    if data["agri_capability_code"]:
        data["agri_capability_code"] = str(
            OatsToAlcsAgCap[data["agri_capability_code"]].value
        )

    return data
