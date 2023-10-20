WITH noi_components_grouped AS (
    SELECT oaac.alr_application_id
    FROM oats.oats_alr_appl_components oaac
        JOIN oats.oats_alr_applications oaa ON oaa.alr_application_id = oaac.alr_application_id
    WHERE oaa.application_class_code = 'NOI'
    GROUP BY oaac.alr_application_id
    HAVING count(oaac.alr_application_id) < 2 -- ignore notice of intents with multiple components
)
SELECT oaa2.alr_application_id,
    oaa2.submitted_to_alc_date,
    nois.uuid
FROM oats.oats_alr_applications oaa2
    JOIN noi_components_grouped ncg ON ncg.alr_application_id = oaa2.alr_application_id
    JOIN alcs.notice_of_intent_submission nois ON nois.file_number = oaa2.alr_application_id::TEXT