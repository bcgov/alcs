WITH noi_components_grouped AS (
    SELECT oaa.alr_application_id
    FROM oats.alcs_etl_applications_nois oaa
    WHERE oaa.application_class_code = 'NOI'
        and oaa.alr_change_code <> 'SRW'
)
SELECT count(*)
FROM noi_components_grouped ncg
    JOIN oats.oats_accomplishments oa ON oa.alr_application_id = ncg.alr_application_id
    JOIN alcs.notice_of_intent_submission nois ON nois.file_number = oa.alr_application_id::text
    AND oa.accomplishment_code = 'AKI';