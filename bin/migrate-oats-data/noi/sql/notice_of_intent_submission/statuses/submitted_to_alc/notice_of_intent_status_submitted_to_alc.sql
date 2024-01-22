WITH noi_components_grouped AS (
    SELECT oaa.alr_application_id
    FROM oats.alcs_etl_applications_nois oaa
    WHERE oaa.application_class_code = 'NOI'
        and oaa.alr_change_code <> 'SRW'
)
SELECT oaa2.alr_application_id,
    oaa2.submitted_to_alc_date,
    nois.uuid
FROM oats.oats_alr_applications oaa2
    JOIN noi_components_grouped ncg ON ncg.alr_application_id = oaa2.alr_application_id
    JOIN alcs.notice_of_intent_submission nois ON nois.file_number = oaa2.alr_application_id::TEXT