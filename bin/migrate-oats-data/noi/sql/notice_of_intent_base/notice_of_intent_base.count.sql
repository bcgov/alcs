WITH nois_with_one_or_zero_component_only AS (
    SELECT oaac.alr_application_id
    FROM oats.oats_alr_appl_components oaac
    GROUP BY oaac.alr_application_id
    HAVING count(oaac.alr_application_id) < 2
)
SELECT count(*)
FROM alcs.notice_of_intent noi
    JOIN nois_with_one_or_zero_component_only oats_noi ON oats_noi.alr_application_id::TEXT = noi.file_number
    JOIN oats.oats_alr_applications oaa ON oaa.alr_application_id = oats_noi.alr_application_id
    AND oaa.application_class_code = 'NOI'
    JOIN oats.oats_alr_appl_components oaac ON oaac.alr_application_id = oats_noi.alr_application_id;