--- tun it manually in IDE of your choice
--- compare to numbers returned by script. The should match
-- total count of set 'SUIN' - Submitted to ALC Incomplete status in ALCS
SELECT count(*)
FROM alcs.notice_of_intent_submission_to_submission_status noistss
WHERE status_type_code = 'SUIN'
    AND effective_date IS NOT NULL;
-- total count of expected 'AKI' - Submitted to ALC Incomplete status
WITH noi_components_grouped AS (
    SELECT oaac.alr_application_id
    FROM oats.oats_alr_appl_components oaac
        JOIN oats.oats_alr_applications oaa ON oaa.alr_application_id = oaac.alr_application_id
    WHERE oaa.application_class_code = 'NOI'
    GROUP BY oaac.alr_application_id
    HAVING count(oaac.alr_application_id) < 2 -- ignore notice of intents with multiple components
)
SELECT count(*)
FROM noi_components_grouped ncg
    JOIN oats.oats_accomplishments oa ON oa.alr_application_id = ncg.alr_application_id
    AND oa.accomplishment_code = 'AKI'
    AND oa.completion_date IS NOT null;