WITH parcels_to_insert AS (
    SELECT nois.uuid,
        osp.subject_property_id
    FROM alcs.notice_of_intent_submission nois
        JOIN oats.oats_subject_properties osp ON osp.alr_application_id = nois.file_number::INTEGER
),
grouped_oats_property_interests_ids AS (
    SELECT opi.subject_property_id
    FROM oats.oats_property_interests opi
    GROUP BY opi.subject_property_id
),
grouped_oats_property_interests as (
    select opi.subject_property_id,
        opi.property_owner_type_code
    FROM oats.oats_property_interests opi
        join grouped_oats_property_interests_ids gopii on gopii.subject_property_id = opi.subject_property_id
)
SELECT uuid AS notice_of_intent_submission_uuid,
    osp.alr_area,
    op.civic_address,
    osp.farm_land_ind,
    op.legal_description,
    op.area_size,
    op.pid,
    op.pin,
    osp.purchase_date,
    gopi.property_owner_type_code,
    osp.subject_property_id
FROM parcels_to_insert as noip
    JOIN oats.oats_subject_properties osp ON osp.subject_property_id = noip.subject_property_id
    JOIN oats.oats_properties op ON op.property_id = osp.property_id
    JOIN grouped_oats_property_interests gopi ON gopi.subject_property_id = osp.subject_property_id