import json

from common import (
    ALRChangeCode,
    OatsToAlcsNaruType,
)
from .submap import (
    add_direction_field,
    add_soil_field,
    add_subdiv,
    create_direction_dict,
    create_soil_dict,
    create_subdiv_dict,
    get_directions_rows,
    get_soil_rows,
    get_subdiv_rows,
    map_direction_values,
    map_soil_data,
    map_subdiv_lots,
)


def prepare_app_sub_data(app_sub_raw_data_list, direction_data, subdiv_data, soil_data):
    """
    This function prepares different lists of data based on the 'alr_change_code' field of each data dict in 'app_sub_raw_data_list'.

    :param app_sub_raw_data_list: A list of raw data dictionaries.
    :param direction_data: A dictionary of adjacent parcel data.
    :param subdiv_data: dictionary of subdivision data lists.
    :param soil_data: dictionary of soil element data.
    :return: Five lists, each containing dictionaries from 'app_sub_raw_data_list' and 'direction_data' grouped based on the 'alr_change_code' field

    Detailed Workflow:
    - Initializes empty lists
    - Iterates over 'app_sub_raw_data_list'
        - Maps adjacent parcel data based on alr_application_id
        - Maps subdivision data on appl_component_id
        _ Maps soil data based on appl_component_id
        - Maps the basic fields of the data dictionary based on the alr_change_code
    - Returns the mapped lists
    """
    nfu_data_list = []
    inc_exc_data_list = []
    naru_data_list = []
    tur_data_list = []
    subd_data_list = []
    soil_data_list = []
    pfrs_data_list = []
    other_data_list = []

    for row in app_sub_raw_data_list:
        data = dict(row)
        data = add_direction_field(data)
        data = add_subdiv(data, json)
        data = add_soil_field(data)
        if data["alr_appl_component_id"] in subdiv_data:
            data = map_subdiv_lots(data, subdiv_data, json)
        if data["alr_application_id"] in direction_data:
            data = map_direction_values(data, direction_data)
        if data["alr_appl_component_id"] in soil_data:
            data = map_soil_data(data, soil_data)
        if data["alr_change_code"] == ALRChangeCode.NFU.value:
            data = _map_duration_field(data, "fill_duration")
            nfu_data_list.append(data)
        elif (
            data["alr_change_code"] == ALRChangeCode.EXC.value
            or data["alr_change_code"] == ALRChangeCode.INC.value
        ):
            data = _map_proposal_background(data)
            inc_exc_data_list.append(data)
        elif data["alr_change_code"] == ALRChangeCode.NAR.value:
            data["rsdntl_use_type_code"] = str(
                OatsToAlcsNaruType[data["rsdntl_use_type_code"]].value
            )
            data = _map_duration_field(data, "fill_duration")
            naru_data_list.append(data)
        elif data["alr_change_code"] == ALRChangeCode.TUR.value:
            tur_data_list.append(data)
        elif data["alr_change_code"] == ALRChangeCode.SDV.value:
            subd_data_list.append(data)
        elif (
            data["alr_change_code"] == ALRChangeCode.EXT.value
            or data["alr_change_code"] == ALRChangeCode.FILL.value
        ):
            data = _map_proposal_background(data)
            soil_data_list.append(data)
        elif data["alr_change_code"] == ALRChangeCode.SCH.value:
            data = _map_duration_field(data, "remove_duration")
            data = _map_duration_field(data, "fill_duration")
            data = _map_proposal_background(data)
            pfrs_data_list.append(data)
        else:
            other_data_list.append(data)

    return (
        nfu_data_list,
        other_data_list,
        inc_exc_data_list,
        naru_data_list,
        tur_data_list,
        subd_data_list,
        soil_data_list,
        pfrs_data_list,
    )


def get_direction_data(rows, cursor):
    # runs query to get direction data and creates a dict based on alr_application_id
    adj_rows = get_directions_rows(rows, cursor)
    direction_data = create_direction_dict(adj_rows)
    return direction_data


def get_subdiv_data(rows, cursor):
    # runs query to get subdivision data and creates a dictionary based on alr_appl_component_id with a list of plots
    subdiv_rows = get_subdiv_rows(rows, cursor)
    subdiv_data = create_subdiv_dict(subdiv_rows)
    return subdiv_data


def get_soil_data(rows, cursor):
    soil_rows = get_soil_rows(rows, cursor)
    soil_data = create_soil_dict(soil_rows)
    return soil_data


def _map_duration_field(data, field_key):
    duration = data.get(field_key)
    data[field_key] = f"{duration} months" if duration is not None else None
    return data


def _map_proposal_background(data):
    background_data = data.get("proposal_background_desc")
    background_summary = data.get("proposal_summary_desc", "")
    if background_data and len(background_data) > 10:
        background_summary = f" {background_summary} . Background: {background_data}"

    if data["alr_change_code"] == ALRChangeCode.INC.value:
        data["proposal_summary_desc"] = background_summary
        # clean excl_why_land field since it is not applicable to Inclusion component
        data["excl_why_land"] = None
    if data["alr_change_code"] == ALRChangeCode.EXC.value:
        data["excl_why_land"] = background_data
    if data["alr_change_code"] in [
        ALRChangeCode.EXT.value,
        ALRChangeCode.FILL.value,
        ALRChangeCode.SCH.value,
    ]:
        data["proposal_summary_desc"] = background_summary
    return data
