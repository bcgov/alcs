WITH app_components_grouped AS (
    SELECT oaa.alr_application_id
    FROM oats.alcs_etl_applications_nois oaa
    WHERE oaa.application_class_code IN ('LOA', 'BLK', 'SCH', 'NAN')
        and oaa.alr_change_code <> 'SRW'
)
SELECT count(*)
FROM app_components_grouped acg
    JOIN oats.oats_accomplishments oa ON oa.alr_application_id = acg.alr_application_id
    JOIN alcs.application_submission apps ON apps.file_number = oa.alr_application_id::text
    AND oa.accomplishment_code = 'AKI';