WITH parcels_to_insert AS (
    SELECT apps.uuid,
        osp.subject_property_id
    FROM alcs.application_submission apps
        JOIN oats.oats_subject_properties osp ON osp.alr_application_id = apps.file_number::bigint
),
grouped_oats_property_interests_ids AS (
    SELECT MIN(property_owner_type_code) AS property_owner_type_code,
        subject_property_id
    FROM oats.oats_property_interests opi
    GROUP BY opi.subject_property_id
)
SELECT count(*)
FROM parcels_to_insert pti
    JOIN oats.oats_subject_properties osp ON osp.subject_property_id = pti.subject_property_id
    JOIN oats.oats_properties op ON op.property_id = osp.property_id
    LEFT JOIN grouped_oats_property_interests_ids gopi ON gopi.subject_property_id = pti.subject_property_id;