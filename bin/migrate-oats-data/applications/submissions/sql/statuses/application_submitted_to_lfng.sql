WITH app_components_grouped AS (
    SELECT oaac.alr_application_id
    FROM oats.oats_alr_appl_components oaac
        JOIN oats.oats_alr_applications oaa ON oaa.alr_application_id = oaac.alr_application_id
    WHERE oaa.application_class_code IN ('LOA', 'BLK')
    GROUP BY oaac.alr_application_id
    HAVING count(oaac.alr_application_id) < 2 -- ignore applications with multiple components
)
SELECT oaa2.alr_application_id,
    oaa2.submitted_to_alc_date,
    apps.uuid
FROM oats.oats_alr_applications oaa2
    JOIN app_components_grouped acg ON acg.alr_application_id = oaa2.alr_application_id
    JOIN alcs.application_submission apps ON apps.file_number = oaa2.alr_application_id::TEXT

--need max func 