WITH noi_components_grouped AS (
    SELECT oaac.alr_application_id
    FROM oats.oats_alr_appl_components oaac
        JOIN oats.oats_alr_applications oaa ON oaa.alr_application_id = oaac.alr_application_id
    WHERE oaa.application_class_code = 'NOI'
    GROUP BY oaac.alr_application_id
    HAVING count(oaac.alr_application_id) < 2 -- ignore notice of intents wit multiple components
)
SELECT noi.file_number,
    noi.type_code,
    noi.local_government_uuid,
    oc.alr_change_code,
    noig.alr_application_id,
    noi.applicant,
    noi.alr_area,
    oc.alr_appl_component_id
FROM noi_components_grouped noig
    LEFT JOIN alcs.notice_of_intent noi ON noi.file_number = noig.alr_application_id::TEXT
    JOIN oats.oats_alr_appl_components oc ON noig.alr_application_id = oc.alr_application_id