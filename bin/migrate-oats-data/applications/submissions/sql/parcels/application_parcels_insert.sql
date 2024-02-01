WITH parcels_to_insert AS (
    SELECT apps.uuid,
        osp.subject_property_id
    FROM alcs.application_submission apps
        JOIN oats.oats_subject_properties osp ON osp.alr_application_id = apps.file_number::bigint
    WHERE osp.alr_application_land_ind = 'Y' -- ensure that only parcels related to application are selected
),
grouped_oats_property_interests_ids AS (
    SELECT MIN(property_owner_type_code) AS property_owner_type_code,
        -- min will not affect anything since all property_owner_type_code are the same in scope of subject_property
        subject_property_id
    FROM oats.oats_property_interests opi
    GROUP BY opi.subject_property_id
)
SELECT uuid AS application_submission_uuid,
    osp.alr_area,
    op.civic_address,
    osp.farm_land_ind,
    op.legal_description,
    op.area_size,
    op.pid,
    op.pin,
    osp.purchase_date,
    gopi.property_owner_type_code,
    osp.subject_property_id,
    op.property_id
FROM parcels_to_insert pti
    JOIN oats.oats_subject_properties osp ON osp.subject_property_id = pti.subject_property_id
    JOIN oats.oats_properties op ON op.property_id = osp.property_id
    LEFT JOIN grouped_oats_property_interests_ids gopi ON gopi.subject_property_id = pti.subject_property_id