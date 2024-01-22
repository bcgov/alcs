--- run it manually in IDE of your choice
--- compare to numbers returned by script. They should match
-- total count of set 'SUBM' - Submitted to ALC status in ALCS
SELECT count(*)
FROM alcs.notice_of_intent_submission_to_submission_status noistss
WHERE status_type_code = 'SUBM'
    AND effective_date IS NOT NULL;
-- total count of expected 'SUBM' - Submitted to ALC status
WITH noi_components_grouped AS (
    SELECT oaa.alr_application_id
    FROM oats.alcs_etl_applications_nois oaa
    WHERE oaa.application_class_code = 'NOI'
        and oaa.alr_change_code <> 'SRW'
)
SELECT count(*)
FROM oats.oats_alr_applications oaa2
    JOIN noi_components_grouped ncg ON ncg.alr_application_id = oaa2.alr_application_id
    JOIN alcs.notice_of_intent_submission nois ON nois.file_number = oaa2.alr_application_id::TEXT
WHERE oaa2.submitted_to_alc_date IS NOT null;