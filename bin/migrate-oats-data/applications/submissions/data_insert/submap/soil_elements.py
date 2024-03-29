from enum import Enum


class SoilAction(Enum):
    RMV = "REMOVE"
    ADD = "ADD"


class SoilProperties:
    ALR_ID = "alr_appl_component_id"
    AREA = "project_area"
    DESC = "material_desc"
    ORIGIN_DESC = "material_origin_desc"
    DURATION = "project_duration"
    VOLUME = "volume"
    DEPTH = "depth"
    ALT_MEASURE = "alternative_measures_desc"


def get_soil_rows(rows, cursor):
    # fetches adjacent land use data, specifically direction, description and type code
    component_ids = [dict(item)["alr_appl_component_id"] for item in rows]
    component_ids_string = ", ".join(str(item) for item in component_ids)
    soil_rows_query = f"""SELECT * from 
                        oats.oats_soil_change_elements osc
                        WHERE osc.alr_appl_component_id in ({component_ids_string})
                        """
    cursor.execute(soil_rows_query)
    soil_rows = cursor.fetchall()
    return soil_rows


def create_soil_dict(soil_rows):
    # creates dict containing fill & remove data
    soil_dict = dict()

    for row in soil_rows:
        app_component_id = row[SoilProperties.ALR_ID]
        soil_dict.setdefault(
            app_component_id, {SoilProperties.ALR_ID: row[SoilProperties.ALR_ID]}
        )

        if (
            row["soil_change_code"] == SoilAction.RMV.value
            and "RMV" not in soil_dict[app_component_id]
        ) or (
            row["soil_change_code"] == SoilAction.ADD.value
            and "ADD" not in soil_dict[app_component_id]
        ):
            action_function = (
                dict_rmv_insert
                if row["soil_change_code"] == SoilAction.RMV.value
                else dict_fill_insert
            )
            action_function(soil_dict, app_component_id, row)

        elif row["soil_change_code"] not in [
            SoilAction.ADD.value,
            SoilAction.RMV.value,
        ]:
            print("unknown soil action")
        else:
            print("ignored element_id:", row["soil_change_element_id"])

    return soil_dict


def map_soil_data(data, soil_data):
    # map soil data into data
    app_component_id = "alr_appl_component_id"
    data["fill_type"] = soil_data.get(data[app_component_id], {}).get("fill_type", None)
    data["fill_origin"] = soil_data.get(data[app_component_id], {}).get(
        "fill_origin", None
    )
    data["total_fill"] = soil_data.get(data[app_component_id], {}).get(
        "total_fill", None
    )
    data["max_fill_depth"] = soil_data.get(data[app_component_id], {}).get(
        "max_fill_depth", None
    )
    data["fill_duration"] = soil_data.get(data[app_component_id], {}).get(
        "fill_duration", None
    )
    data["fill_area"] = soil_data.get(data[app_component_id], {}).get("fill_area", None)
    data["import_fill"] = soil_data.get(data[app_component_id], {}).get(
        "import_fill", None
    )
    data["remove_type"] = soil_data.get(data[app_component_id], {}).get(
        "remove_type", None
    )
    data["remove_origin"] = soil_data.get(data[app_component_id], {}).get(
        "remove_origin", None
    )
    data["total_remove"] = soil_data.get(data[app_component_id], {}).get(
        "total_remove", None
    )
    data["max_remove_depth"] = soil_data.get(data[app_component_id], {}).get(
        "max_remove_depth", None
    )
    data["remove_duration"] = soil_data.get(data[app_component_id], {}).get(
        "remove_duration", None
    )
    duration = soil_data.get(data[app_component_id], {}).get("duration")
    data["duration"] = f"{duration} months" if duration is not None else None
    data["remove_area"] = soil_data.get(data[app_component_id], {}).get(
        "remove_area", None
    )
    data["alternative_measures_desc"] = soil_data.get(data[app_component_id], {}).get(
        "alternative_measures_desc", None
    )
    return data


def add_soil_field(data):
    # populates columns to be inserted
    data["fill_type"] = None
    data["fill_origin"] = None
    data["total_fill"] = None
    data["max_fill_depth"] = None
    data["fill_duration"] = None
    data["fill_area"] = None
    data["import_fill"] = None
    data["remove_type"] = None
    data["remove_origin"] = None
    data["total_remove"] = None
    data["max_remove_depth"] = None
    data["remove_duration"] = None
    data["duration"] = None
    data["remove_area"] = None
    data["alternative_measures_desc"] = None
    return data


def dict_fill_insert(soil_dict, app_component_id, row):
    soil_dict[app_component_id]["fill_type"] = row[SoilProperties.DESC]
    soil_dict[app_component_id]["fill_origin"] = row[SoilProperties.ORIGIN_DESC]
    soil_dict[app_component_id]["total_fill"] = row[SoilProperties.VOLUME]
    soil_dict[app_component_id]["max_fill_depth"] = row[SoilProperties.DEPTH]
    soil_dict[app_component_id]["fill_duration"] = row[SoilProperties.DURATION]
    soil_dict[app_component_id]["duration"] = row[SoilProperties.DURATION]
    soil_dict[app_component_id]["fill_area"] = row[SoilProperties.AREA]
    soil_dict[app_component_id]["import_fill"] = True
    soil_dict[app_component_id]["alternative_measures_desc"] = row[
        SoilProperties.ALT_MEASURE
    ]
    soil_dict[app_component_id][SoilAction.ADD.name] = True
    return


def dict_rmv_insert(soil_dict, app_component_id, row):
    soil_dict[app_component_id]["remove_type"] = row[SoilProperties.DESC]
    soil_dict[app_component_id]["remove_origin"] = row[SoilProperties.ORIGIN_DESC]
    soil_dict[app_component_id]["max_remove_depth"] = row[SoilProperties.DEPTH]
    soil_dict[app_component_id]["total_remove"] = row[SoilProperties.VOLUME]
    soil_dict[app_component_id]["remove_duration"] = row[SoilProperties.DURATION]
    soil_dict[app_component_id]["duration"] = row[SoilProperties.DURATION]
    soil_dict[app_component_id]["remove_area"] = row[SoilProperties.AREA]
    soil_dict[app_component_id][SoilAction.RMV.name] = True
    return
