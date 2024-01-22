--- run it manually in IDE of your choice
--- compare to numbers returned by script. They should match
-- total count of set 'SUIN' - Submitted to ALC Incomplete status in ALCS
SELECT count(*)
FROM alcs.notice_of_intent_submission_to_submission_status noistss
WHERE status_type_code = 'SUIN'
    AND effective_date IS NOT NULL;
-- total count of expected 'AKI' - Submitted to ALC Incomplete status
WITH noi_components_grouped AS (
    SELECT oaa.alr_application_id
    FROM oats.alcs_etl_applications_nois oaa
    WHERE oaa.application_class_code = 'NOI'
        and oaa.alr_change_code <> 'SRW'
)
SELECT count(*)
FROM noi_components_grouped ncg
    JOIN oats.oats_accomplishments oa ON oa.alr_application_id = ncg.alr_application_id
    AND oa.accomplishment_code = 'AKI'
    AND oa.completion_date IS NOT null;