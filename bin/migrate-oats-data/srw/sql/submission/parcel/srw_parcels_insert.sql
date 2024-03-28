WITH parcels_to_insert AS (
    SELECT nos.uuid,
        osp.subject_property_id
    FROM alcs.notification_submission nos
        JOIN oats.oats_subject_properties osp ON osp.alr_application_id = nos.file_number::bigint
    WHERE osp.alr_application_land_ind = 'Y' -- ensure that only parcels related to application are selected
        AND nos.type_code = 'SRW'
),
grouped_oats_property_interests_ids AS (
    SELECT subject_property_id, MAX(property_owner_type_code) AS property_owner_type_code
    FROM oats.oats_property_interests opi
    GROUP BY opi.subject_property_id
)
SELECT uuid AS notification_submission_uuid,
    op.civic_address,
    op.legal_description,
    op.area_size,
    op.pid,
    op.pin,
    osp.subject_property_id,
    op.property_id,
    gopi.property_owner_type_code
FROM parcels_to_insert pti
    JOIN oats.oats_subject_properties osp ON osp.subject_property_id = pti.subject_property_id
    JOIN oats.oats_properties op ON op.property_id = osp.property_id
    LEFT JOIN grouped_oats_property_interests_ids gopi ON gopi.subject_property_id = pti.subject_property_id