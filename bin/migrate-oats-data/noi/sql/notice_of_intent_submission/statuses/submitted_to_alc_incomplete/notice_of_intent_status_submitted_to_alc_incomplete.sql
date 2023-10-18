WITH noi_components_grouped AS (
    SELECT oaac.alr_application_id
    FROM oats.oats_alr_appl_components oaac
        JOIN oats.oats_alr_applications oaa ON oaa.alr_application_id = oaac.alr_application_id
    WHERE oaa.application_class_code = 'NOI'
    GROUP BY oaac.alr_application_id
    HAVING count(oaac.alr_application_id) < 2 -- ignore notice of intents with multiple components
)
SELECT oa.alr_application_id,
    completion_date,
    nois.uuid
FROM noi_components_grouped ncg
    JOIN oats.oats_accomplishments oa ON oa.alr_application_id = ncg.alr_application_id
    JOIN alcs.notice_of_intent_submission nois ON nois.file_number = oa.alr_application_id::text
    AND oa.accomplishment_code = 'AKI'