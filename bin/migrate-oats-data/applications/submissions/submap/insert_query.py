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
                    purpose
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
                    %(proposal_summary_desc)s
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
    unique_fields = ", incl_excl_hectares"
    unique_values = ", %(alr_area)s"
    return get_insert_query(unique_fields, unique_values)
