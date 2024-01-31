from common import (
    OATS_ETL_USER,
    setup_and_get_logger,
    add_timezone_and_keep_date_part,
    ALRChangeCode,
    OatsToAlcsAgCap,
    OatsToAlcsAgCapSource,
    OatsLegislationCodesToAlcsApplicant,
    OatsToAlcsNfuTypes,
    OATS_NFU_SUBTYPES,
    BATCH_UPLOAD_SIZE,
    OatsToAlcsNaruType,
)
from db import inject_conn_pool
from psycopg2.extras import RealDictCursor, execute_batch

etl_name = "init_application_decision_components"
logger = setup_and_get_logger(etl_name)


@inject_conn_pool
def init_application_decision_components(conn=None, batch_size=BATCH_UPLOAD_SIZE):
    """
    This function is responsible for initializing the application_decision_components in ALCS.

    Args:
    conn (psycopg2.extensions.connection): PostgreSQL database connection. Provided by the decorator.
    batch_size (int): The number of items to process at once. Defaults to BATCH_UPLOAD_SIZE.
    """

    logger.info(f"Start {etl_name}")
    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        with open(
            "applications/decisions/sql/components/application_decision_components_insert_count.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            count_query = sql_file.read()
            cursor.execute(count_query)
            count_total = dict(cursor.fetchone())["count"]
        logger.info(
            f"Total Application Decision Components data to insert: {count_total}"
        )

        failed_inserts = 0
        successful_inserts_count = 0
        last_decision_component_id = 0

        with open(
            "applications/decisions/sql/components/application_decision_components_insert.sql",
            "r",
            encoding="utf-8",
        ) as sql_file:
            query = sql_file.read()

            while True:
                cursor.execute(
                    f"""{query} 
                    WHERE oaac.alr_appl_component_id > {last_decision_component_id} ORDER BY oaac.alr_appl_component_id;"""
                )

                rows = cursor.fetchmany(batch_size)

                if not rows:
                    break
                try:
                    decision_components_to_be_inserted_count = len(rows)

                    _insert_application_decision_components(
                        conn, batch_size, cursor, rows
                    )

                    successful_inserts_count = (
                        successful_inserts_count
                        + decision_components_to_be_inserted_count
                    )
                    last_decision_component_id = rows[-1]["component_id"]

                    logger.info(
                        f"retrieved/inserted items count: {decision_components_to_be_inserted_count}; total successfully inserted decision components so far {successful_inserts_count}; last inserted alr_appl_component_id: {last_decision_component_id}"
                    )
                except Exception as err:
                    logger.exception(err)
                    conn.rollback()
                    failed_inserts = count_total - successful_inserts_count
                    last_decision_component_id = last_decision_component_id + 1

    logger.info(
        f"Finished {etl_name}: total amount of successful inserts {successful_inserts_count}, total failed inserts {failed_inserts}"
    )


def _insert_application_decision_components(conn, batch_size, cursor, rows):
    query = _get_insert_query()
    parsed_data_list = _prepare_oats_alr_applications_data(rows)

    if len(parsed_data_list) > 0:
        execute_batch(cursor, query, parsed_data_list, page_size=batch_size)

    conn.commit()


def _get_insert_query():
    query = f"""
                INSERT INTO alcs.application_decision_component (
                    ag_cap,
                    ag_cap_consultant,
                    ag_cap_map,
                    ag_cap_source,
                    alr_area,
                    audit_created_by,
                    end_date,
                    end_date2,
                    expiry_date,
                    application_decision_component_type_code,
                    application_decision_uuid,
                    oats_alr_appl_component_id,
                    naru_subtype_code,
                    nfu_sub_type,
                    nfu_type,
                    incl_excl_applicant_type
                )
                VALUES (
                    %(ag_cap)s,
                    %(ag_cap_consultant)s,
                    %(ag_cap_map)s,
                    %(ag_cap_source)s,
                    %(alr_area)s,
                    %(audit_created_by)s,
                    %(end_date)s,
                    %(end_date2)s,
                    %(expiry_date)s,
                    %(application_decision_component_type_code)s,
                    %(application_decision_uuid)s,
                    %(alr_appl_component_id)s,
                    %(naru_type_code)s,
                    %(nonfarm_use_subtype_code)s,
                    %(nonfarm_use_type_code)s,
                    %(applicant_type)s

                )
                ON CONFLICT DO NOTHING; -- there are no components on prod
    """
    return query


def _prepare_oats_alr_applications_data(row_data_list):
    data_list = []
    for row in row_data_list:
        if row.get("alr_change_code", None) in [
            ALRChangeCode.SCH.value,
            ALRChangeCode.FILL.value,
            ALRChangeCode.EXT.value,
        ]:
            end_date, end_date2 = _map_end_date(row)
            mapped_row = {
                "ag_cap": str(OatsToAlcsAgCap[row["agri_capability_code"]].value)
                if row.get("agri_capability_code")
                else None,
                "ag_cap_consultant": row.get("agri_cap_consultant"),
                "ag_cap_map": row.get("agri_cap_map"),
                "ag_cap_source": str(
                    OatsToAlcsAgCapSource[row["capability_source_code"]].value
                )
                if row.get("capability_source_code")
                else None,
                "alr_area": row.get("component_area"),
                "audit_created_by": OATS_ETL_USER,
                "end_date": end_date,
                "end_date2": end_date2,
                "expiry_date": None,
                "application_decision_component_type_code": _map_component_type_code(
                    row
                ),
                "application_decision_uuid": row.get("decision_uuid"),
                "alr_appl_component_id": row.get("component_id"),
                "naru_type_code": None,
                "nonfarm_use_subtype_code": None,
                "nonfarm_use_type_code": None,
                "applicant_type": None,
            }
            data_list.append(mapped_row)

        elif row.get("alr_change_code", None) in [
            ALRChangeCode.TUR.value,
            ALRChangeCode.INC.value,
            ALRChangeCode.EXC.value,
            ALRChangeCode.SDV.value,
            ALRChangeCode.CSC.value,
        ]:
            mapped_row = {
                "ag_cap": str(OatsToAlcsAgCap[row["agri_capability_code"]].value)
                if row.get("agri_capability_code")
                else None,
                "ag_cap_consultant": row.get("agri_cap_consultant"),
                "ag_cap_map": row.get("agri_cap_map"),
                "ag_cap_source": str(
                    OatsToAlcsAgCapSource[row["capability_source_code"]].value
                )
                if row.get("capability_source_code")
                else None,
                "alr_area": row.get("component_area"),
                "audit_created_by": OATS_ETL_USER,
                "end_date": None,
                "end_date2": None,
                "expiry_date": add_timezone_and_keep_date_part(
                    row.get("decision_expiry_date")
                ),
                "application_decision_component_type_code": _map_component_type_code(
                    row
                ),
                "application_decision_uuid": row.get("decision_uuid"),
                "alr_appl_component_id": row.get("component_id"),
                "naru_type_code": None,
                "nonfarm_use_subtype_code": None,
                "nonfarm_use_type_code": None,
                "applicant_type": _map_legislation_to_applicant_type(row),
            }
            data_list.append(mapped_row)

        elif row.get("alr_change_code", None) in [
            ALRChangeCode.NFU.value,
        ]:
            nfu_type, nfu_subtype, nfu_end_date = _map_oats_to_alcs_nfu(row)
            mapped_row = {
                "ag_cap": str(OatsToAlcsAgCap[row["agri_capability_code"]].value)
                if row.get("agri_capability_code")
                else None,
                "ag_cap_consultant": row.get("agri_cap_consultant"),
                "ag_cap_map": row.get("agri_cap_map"),
                "ag_cap_source": str(
                    OatsToAlcsAgCapSource[row["capability_source_code"]].value
                )
                if row.get("capability_source_code")
                else None,
                "alr_area": row.get("component_area"),
                "audit_created_by": OATS_ETL_USER,
                "end_date": nfu_end_date,
                "end_date2": None,
                "expiry_date": None,
                "application_decision_component_type_code": _map_component_type_code(
                    row
                ),
                "application_decision_uuid": row.get("decision_uuid"),
                "alr_appl_component_id": row.get("component_id"),
                "naru_type_code": _map_naru_subtype(row),
                "nonfarm_use_subtype_code": nfu_subtype,
                "nonfarm_use_type_code": nfu_type,
                "applicant_type": _map_legislation_to_applicant_type(row),
            }
            data_list.append(mapped_row)

        elif row.get("alr_change_code", None) in [
            ALRChangeCode.NAR.value,
        ]:
            mapped_row = {
                "ag_cap": str(OatsToAlcsAgCap[row["agri_capability_code"]].value)
                if row.get("agri_capability_code")
                else None,
                "ag_cap_consultant": row.get("agri_cap_consultant"),
                "ag_cap_map": row.get("agri_cap_map"),
                "ag_cap_source": str(
                    OatsToAlcsAgCapSource[row["capability_source_code"]].value
                )
                if row.get("capability_source_code")
                else None,
                "alr_area": row.get("component_area"),
                "audit_created_by": OATS_ETL_USER,
                "end_date": add_timezone_and_keep_date_part(row.get("nonfarm_use_end_date")),
                "end_date2": None,
                "expiry_date": add_timezone_and_keep_date_part(
                    row.get("decision_expiry_date")
                ),
                "application_decision_component_type_code": _map_component_type_code(
                    row
                ),
                "application_decision_uuid": row.get("decision_uuid"),
                "alr_appl_component_id": row.get("component_id"),
                "naru_type_code": _map_naru_subtype(row),
                "nonfarm_use_subtype_code": None,
                "nonfarm_use_type_code": None,
                "applicant_type": _map_legislation_to_applicant_type(row),
            }
            data_list.append(mapped_row)

    return data_list


def _map_component_type_code(row):
    alr_change_code = row.get("alr_change_code")
    if alr_change_code == ALRChangeCode.SCH.value:
        return "PFRS"

    if alr_change_code == ALRChangeCode.EXT.value:
        return "ROSO"

    if alr_change_code == ALRChangeCode.FILL.value:
        return "POFO"

    if alr_change_code == ALRChangeCode.TUR.value:
        return "TURP"

    if alr_change_code == ALRChangeCode.INC.value:
        return "INCL"

    if alr_change_code == ALRChangeCode.EXC.value:
        return "EXCL"

    if alr_change_code == ALRChangeCode.SDV.value:
        return "SUBD"

    if alr_change_code == ALRChangeCode.NFU.value:
        return "NFUP"

    if alr_change_code == ALRChangeCode.NAR.value:
        return "NARU"
    
    if alr_change_code == ALRChangeCode.CSC.value:
        return "COVE"

    return None


def _map_oats_to_alcs_nfu(data):
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

    nfu_type = data["nonfarm_use_type_code"]
    nfu_subtype = data["nonfarm_use_subtype_code"]
    end_date = add_timezone_and_keep_date_part(
        data.get("nonfarm_use_end_date", None)
    )
    expiry_date = add_timezone_and_keep_date_part(
        data.get("decision_expiry_date", None)
    )
    if end_date and expiry_date:
        nfu_end_date = max(end_date, expiry_date)
    elif end_date:
        nfu_end_date = end_date
    elif expiry_date:
        nfu_end_date = expiry_date
    else:
        nfu_end_date = None

    return nfu_type, nfu_subtype, nfu_end_date


def _map_oats_to_alcs_nfu_subtypes(nfu_type_code, nfu_subtype_code):
    for dict_obj in OATS_NFU_SUBTYPES:
        if str(dict_obj["type_key"]) == str(nfu_type_code) and str(
            dict_obj["subtype_key"]
        ) == str(nfu_subtype_code):
            return dict_obj["value"]

    # Return None when no matching key found
    return None


def _map_legislation_to_applicant_type(row):
    if row.get("legislation_code"):
        row["legislation_code"] = str(
            OatsLegislationCodesToAlcsApplicant[row["legislation_code"]].value
        )

    return row.get("legislation_code")


def _map_naru_subtype(row):
    if row.get("rsdntl_use_type_code"):
        row["rsdntl_use_type_code"] = str(
            OatsToAlcsNaruType[row["rsdntl_use_type_code"]].value
        )
    return row.get("rsdntl_use_type_code")


def _map_end_date(row):
    alr_change_code = row.get("alr_change_code")
    end_date = add_timezone_and_keep_date_part(row.get("nonfarm_use_end_date"))
    expiry_date = add_timezone_and_keep_date_part(row.get("decision_expiry_date"))
    date = None
    if end_date and expiry_date:
        date = max(end_date, expiry_date)
    elif end_date:
        date = end_date
    elif expiry_date:
        date = expiry_date

    if alr_change_code in [
        ALRChangeCode.SCH.value,
        ALRChangeCode.EXT.value,
        ALRChangeCode.FILL.value,
    ]:
        return date, date if alr_change_code == ALRChangeCode.SCH.value else None
    return None, None


@inject_conn_pool
def clean_application_decision_components(conn=None):
    logger.info("Start application_decision_component cleaning")
    with conn.cursor() as cursor:
        cursor.execute(
            f"DELETE FROM alcs.application_decision_component WHERE audit_created_by = '{OATS_ETL_USER}' AND audit_updated_by is NULL"
        )
        logger.info(f"Deleted items count = {cursor.rowcount}")

    conn.commit()
