SELECT count(*)
FROM alcs.notice_of_intent_submission nois
WHERE audit_created_by = 'oats_etl'
    AND (
        north_land_use_type IS NULL
        OR north_land_use_type_description IS NULL
        OR south_land_use_type IS NULL
        OR south_land_use_type_description IS NULL
        OR east_land_use_type IS NULL
        OR east_land_use_type_description IS NULL
        OR west_land_use_type IS NULL
        OR west_land_use_type_description IS NULL
    )