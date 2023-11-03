-- Total count of inserted parcels should match total count of parcels in oats
-- Get total count of parcels in ALCS
SELECT count(*)
FROM alcs.notice_of_intent_parcel noip;
-- Get total count of parcels in OATS
WITH noi_components_grouped AS (
    SELECT oaac.alr_application_id
    FROM oats.oats_alr_appl_components oaac
        JOIN oats.oats_alr_applications oaa ON oaa.alr_application_id = oaac.alr_application_id
    WHERE oaa.application_class_code = 'NOI'
    GROUP BY oaac.alr_application_id
    HAVING count(oaac.alr_application_id) < 2 -- ignore notice of intents with multiple components
)
SELECT count(*)
FROM noi_components_grouped noig
    JOIN oats.oats_subject_properties osp ON osp.alr_application_id = noig.alr_application_id