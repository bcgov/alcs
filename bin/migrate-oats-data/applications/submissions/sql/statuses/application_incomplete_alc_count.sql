WITH app_components_grouped AS (
    SELECT oaac.alr_application_id
    FROM oats.oats_alr_appl_components oaac
        JOIN oats.oats_alr_applications oaa ON oaa.alr_application_id = oaac.alr_application_id
    WHERE oaa.application_class_code IN ('LOA', 'BLK')
    GROUP BY oaac.alr_application_id
    HAVING count(oaac.alr_application_id) < 2 -- ignore applications with multiple components
)
SELECT count(*)
FROM app_components_grouped acg
    JOIN oats.oats_accomplishments oa ON oa.alr_application_id = acg.alr_application_id
    JOIN alcs.application_submission apps ON apps.file_number = oa.alr_application_id::text
    AND oa.accomplishment_code = 'AKI';