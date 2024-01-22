WITH noi_components_grouped AS (
    SELECT oaa.alr_application_id
    FROM oats.alcs_etl_applications_nois oaa
    WHERE oaa.application_class_code = 'NOI'
        and oaa.alr_change_code <> 'SRW'
)
SELECT count(*)
FROM noi_components_grouped
    JOIN alcs.notice_of_intent_submission nois ON nois.file_number = alr_application_id::TEXT;