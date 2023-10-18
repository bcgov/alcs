from psycopg2.extras import execute_batch
from .data_prep import prepare_app_sub_data


def insert_app_sub_records(
    conn, batch_size, cursor, rows, direction_data, subdiv_data, soil_data
):
    """
    Function to insert submission records in batches.

    Args:
    conn (obj): Connection to the database.
    batch_size (int): Number of rows to execute at one time.
    cursor (obj): Cursor object to execute queries.
    rows (list): Rows of data to insert in the database.
    direction_data (dict): Dictionary of adjacent parcel data
    subdiv_data: dictionary of subdivision data lists
    soil_data: dictionary of soil element data.

    Returns:
    None: Commits the changes to the database.
    """
    (
        nfu_data_list,
        other_data_list,
        inc_exc_data_list,
        naru_data_list,
        tur_data_list,
        subd_data_list,
        soil_data_list,
    ) = prepare_app_sub_data(rows, direction_data, subdiv_data, soil_data)

    if len(nfu_data_list) > 0:
        execute_batch(
            cursor,
            get_insert_query_for_nfu(),
            nfu_data_list,
            page_size=batch_size,
        )

    if len(inc_exc_data_list) > 0:
        execute_batch(
            cursor,
            get_insert_query_for_inc_exc(),
            inc_exc_data_list,
            page_size=batch_size,
        )

    if len(naru_data_list) > 0:
        execute_batch(
            cursor,
            get_insert_query_for_naru(),
            naru_data_list,
            page_size=batch_size,
        )

    if len(tur_data_list) > 0:
        execute_batch(
            cursor,
            get_insert_query_for_tur(),
            tur_data_list,
            page_size=batch_size,
        )

    if len(subd_data_list) > 0:
        execute_batch(
            cursor,
            get_insert_query_for_subd(),
            subd_data_list,
            page_size=batch_size,
        )

    if len(soil_data_list) > 0:
        execute_batch(
            cursor,
            get_insert_query_for_soil(),
            soil_data_list,
            page_size=batch_size,
        )

    if len(other_data_list) > 0:
        execute_batch(
            cursor,
            get_insert_query("", ""),
            other_data_list,
            page_size=batch_size,
        )

    conn.commit()


def get_insert_query(unique_fields, unique_values):
    # unique_fields takes input from called function and appends to query
    query = """
                INSERT INTO alcs.application_submission (
                    file_number,
                    local_government_uuid,
                    type_code,
                    is_draft,
                    audit_created_by,
                    applicant,
                    east_land_use_type_description,
                    west_land_use_type_description,
                    north_land_use_type_description,
                    south_land_use_type_description,
                    east_land_use_type,
                    west_land_use_type,
                    north_land_use_type,
                    south_land_use_type,
                    subd_proposed_lots,
                    purpose,
                    parcels_agriculture_improvement_description,
                    parcels_agriculture_description,
                    parcels_non_agriculture_use_description
                    {unique_fields}
                )
                VALUES (
                    %(file_number)s,
                    %(local_government_uuid)s,
                    %(type_code)s,
                    false,
                    'oats_etl',
                    %(applicant)s,
                    %(east_land_use_type_description)s,
                    %(west_land_use_type_description)s,
                    %(north_land_use_type_description)s,
                    %(south_land_use_type_description)s,
                    %(east_land_use_type)s,
                    %(west_land_use_type)s,
                    %(north_land_use_type)s,
                    %(south_land_use_type)s,
                    %(subd_proposed_lots)s,
                    %(proposal_summary_desc)s,
                    %(agricultural_improvement_desc)s,
                    %(current_land_use_desc)s,
                    %(non_agricultural_uses_desc)s
                    {unique_values}
                )
    """
    return query.format(unique_fields=unique_fields, unique_values=unique_values)


def get_insert_query_for_nfu():
    unique_fields = """, nfu_hectares,
                        nfu_will_import_fill,
                        nfu_fill_volume,
                        nfu_max_fill_depth,
                        nfu_project_duration_amount,
                        nfu_fill_type_description,
                        nfu_fill_origin_description,
                        nfu_project_duration_unit,
                        nfu_total_fill_area
                        """
    unique_values = """, %(alr_area)s,
                        %(import_fill)s,
                        %(total_fill)s,
                        %(max_fill_depth)s,
                        %(fill_duration)s,
                        %(fill_type)s,
                        %(fill_origin)s,
                        %(fill_duration_unit)s,
                        %(fill_area)s
                    """
    return get_insert_query(unique_fields, unique_values)


def get_insert_query_for_naru():
    unique_fields = """,
                        naru_will_import_fill,
                        naru_to_place_volume,
                        naru_to_place_maximum_depth,
                        naru_to_place_average_depth,
                        naru_project_duration_amount,
                        naru_fill_type,
                        naru_fill_origin,
                        naru_project_duration_unit,  
                        naru_to_place_area,
                        naru_subtype_code,
                        naru_infrastructure,
                        naru_existing_structures,
                        naru_sleeping_units,
                        naru_residence_necessity,
                        naru_agri_tourism,
                        naru_floor_area,
                        naru_location_rationale
                        """
    unique_values = """,
                        %(import_fill)s,
                        %(total_fill)s,
                        %(max_fill_depth)s,
                        %(max_fill_depth)s,
                        %(fill_duration)s,
                        %(fill_type)s,
                        %(fill_origin)s,
                        %(fill_duration_unit)s,
                        %(fill_area)s,
                        %(rsdntl_use_type_code)s,
                        %(infra_desc)s,
                        %(cur_struc_desc)s,
                        %(sleeping_units)s,
                        %(support_desc)s,
                        %(tour_env_desc)s,
                        %(component_area)s,
                        %(proposal_background_desc)s
                    """
    return get_insert_query(unique_fields, unique_values)


def get_insert_query_for_inc_exc():
    unique_fields = """, 
                        incl_excl_hectares,
                        excl_why_land,
                        incl_agriculture_support,
                        incl_improvements,
                        excl_share_government_borders
                        """
    unique_values = """, 
                        %(component_area)s,
                        %(proposal_background_desc)s,
                        %(support_desc)s,
                        %(improvements_desc)s,
                        %(applicationshare_ind)s
                        """
    return get_insert_query(unique_fields, unique_values)


def get_insert_query_for_tur():
    unique_fields = """, 
                        tur_agricultural_activities,
                        tur_reduce_negative_impacts,
                        tur_outside_lands,
                        tur_total_corridor_area,
                        tur_all_owners_notified
                    """
    unique_values = """, 
                        %(agricultural_activities_desc)s,
                        %(impact_reduction_desc)s,
                        %(proposal_background_desc)s,
                        %(component_area)s,
                        %(owners_notified_ind)s
                    """
    return get_insert_query(unique_fields, unique_values)


def get_insert_query_for_soil():
    unique_fields = """, soil_type_removed,
                        soil_reduce_negative_impacts,
                        soil_to_remove_volume,
                        soil_to_remove_area,
                        soil_to_remove_maximum_depth,
                        soil_to_remove_average_depth,
                        soil_project_duration_amount,
                        soil_project_duration_unit,
                        soil_fill_type_to_place,
                        soil_alternative_measures,
                        soil_to_place_volume,
                        soil_to_place_area,
                        soil_to_place_maximum_depth,
                        soil_to_place_average_depth,
                        soil_is_follow_up,
                        soil_follow_up_ids
                    """
    unique_values = """, %(remove_type)s,
                        %(impact_reduction_desc)s,
                        %(total_remove)s,
                        %(remove_area)s,
                        %(max_remove_depth)s,
                        %(max_remove_depth)s,
                        %(duration)s,
                        %(remove_duration_unit)s,
                        %(fill_type)s,
                        %(alternative_measures_desc)s,
                        %(total_fill)s,
                        %(fill_area)s,
                        %(max_fill_depth)s,
                        %(max_fill_depth)s,
                        %(followup_noi_ind)s,
                        %(followup_noi_number)s
                    """
    return get_insert_query(unique_fields, unique_values)


def get_insert_query_for_subd():
    unique_fields = """, 
                        subd_suitability,
                        subd_agriculture_support,
                        subd_is_home_site_severance
                        """
    unique_values = """, 
                        %(proposal_background_desc)s,
                        %(support_desc)s,
                        %(homesite_severance_ind)s
                        """
    return get_insert_query(unique_fields, unique_values)
