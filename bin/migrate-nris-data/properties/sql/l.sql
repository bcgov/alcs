insert into
    alcs.compliance_and_enforcement_property (
        civic_address,
        region_code,
        latitude,
        longitude,
        ownership_type_code,
        pid,
        area_hectares,
        alr_percentage,
        alc_history,
        file_uuid,
        local_government_uuid
    )
values %s;