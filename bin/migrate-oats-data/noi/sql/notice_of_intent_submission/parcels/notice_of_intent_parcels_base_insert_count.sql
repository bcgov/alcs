WITH noi_components_grouped AS (
    SELECT oaac.alr_application_id
    FROM oats.oats_alr_appl_components oaac
        JOIN oats.oats_alr_applications oaa ON oaa.alr_application_id = oaac.alr_application_id
    WHERE oaa.application_class_code = 'NOI'
    GROUP BY oaac.alr_application_id
    HAVING count(oaac.alr_application_id) < 2 -- ignore notice of intents with multiple components
),
grouped_oats_property_interests AS (
    SELECT opi.subject_property_id
    FROM oats.oats_property_interests opi
    GROUP BY opi.subject_property_id
)
SELECT count(*)
FROM oats.oats_subject_properties osp
    JOIN noi_components_grouped ncg ON ncg.alr_application_id = osp.alr_application_id
    JOIN oats.oats_properties op ON op.property_id = osp.property_id
    JOIN grouped_oats_property_interests gopi ON gopi.subject_property_id = osp.subject_property_id;