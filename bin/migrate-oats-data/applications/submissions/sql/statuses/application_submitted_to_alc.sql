WITH app_components_grouped AS (
    SELECT oaa.alr_application_id
    FROM oats.alcs_etl_applications_nois oaa
    WHERE oaa.application_class_code IN ('LOA', 'BLK', 'SCH', 'NAN')
        and oaa.alr_change_code <> 'SRW'
)
SELECT oaa2.alr_application_id,
    oaa2.submitted_to_alc_date,
    apps.uuid
FROM oats.oats_alr_applications oaa2
    JOIN app_components_grouped acg ON acg.alr_application_id = oaa2.alr_application_id
    JOIN alcs.application_submission apps ON apps.file_number = oaa2.alr_application_id::TEXT