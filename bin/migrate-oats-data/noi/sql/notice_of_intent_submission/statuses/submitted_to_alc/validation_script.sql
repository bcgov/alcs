--- tun it manually in IDE of your choice
--- compare to numbers returned by script. The should match
-- total count of set 'SUBM' statuses in ALCS
SELECT count(*)
FROM alcs.notice_of_intent_submission_to_submission_status noistss
WHERE status_type_code = 'SUBM'
    AND effective_date IS NOT NULL;
-- total count of expected 'SUBM' statuses
WITH noi_components_grouped AS (
    SELECT oaac.alr_application_id
    FROM oats.oats_alr_appl_components oaac
        JOIN oats.oats_alr_applications oaa ON oaa.alr_application_id = oaac.alr_application_id
    WHERE oaa.application_class_code = 'NOI'
    GROUP BY oaac.alr_application_id
    HAVING count(oaac.alr_application_id) < 2 -- ignore notice of intents with multiple components
)
SELECT count(*)
FROM oats.oats_alr_applications oaa2
    JOIN noi_components_grouped ncg ON ncg.alr_application_id = oaa2.alr_application_id
    JOIN alcs.notice_of_intent_submission nois ON nois.file_number = oaa2.alr_application_id::TEXT
WHERE oaa2.submitted_to_alc_date IS NOT null;