WITH nois_with_one_or_zero_component_only AS (
    SELECT oaa.alr_application_id,
        oaa.alr_appl_component_id
    FROM oats.alcs_etl_applications_nois oaa
    WHERE oaa.application_class_code = 'NOI'
        and oaa.alr_change_code <> 'SRW'
)
SELECT *
FROM oats.oats_adjacent_land_uses oalu
    JOIN nois_with_one_or_zero_component_only ON oalu.alr_application_id = nois_with_one_or_zero_component_only.alr_application_id