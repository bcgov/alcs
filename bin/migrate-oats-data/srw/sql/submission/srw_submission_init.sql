WITH srw_components_grouped AS (
    SELECT *
    FROM oats.alcs_etl_srw oaa
    WHERE oaa.application_class_code = 'NAN'
        and oaa.alr_change_code = 'SRW'
)
SELECT n.file_number,
    n.type_code,
    n.local_government_uuid,
    oc.alr_change_code,
    srwg.alr_application_id,
    oc.alr_appl_component_id
FROM srw_components_grouped srwg
    LEFT JOIN alcs.notification n ON n.file_number = srwg.alr_application_id::TEXT
    AND n.type_code = 'SRW'
    JOIN oats.oats_alr_appl_components oc ON srwg.alr_appl_component_id = oc.alr_appl_component_id