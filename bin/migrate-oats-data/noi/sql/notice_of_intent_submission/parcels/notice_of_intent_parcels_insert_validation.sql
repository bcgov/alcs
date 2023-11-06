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
    JOIN oats.oats_subject_properties osp ON osp.alr_application_id = noig.alr_application_id;
-- return records that are different between OATS and ALCS
WITH parcels_to_insert AS (
    SELECT nois.uuid,
        osp.subject_property_id
    FROM alcs.notice_of_intent_submission nois
        JOIN oats.oats_subject_properties osp ON osp.alr_application_id = nois.file_number::INTEGER
),
grouped_oats_property_interests_ids AS (
    SELECT MIN(property_owner_type_code) AS property_owner_type_code,
        -- min will not affect anything since all property_owner_type_code are the same in scope of subject_property
        subject_property_id
    FROM oats.oats_property_interests opi
    GROUP BY opi.subject_property_id
) --- compares parcel fields and returns mismatches. Since oats has a lot of bad data ignore all records prior the 1900s
SELECT noip.alr_area,
    osp.alr_area,
    noip.civic_address,
    op.civic_address,
    noip.is_farm,
    osp.farm_land_ind,
    noip.legal_description,
    op.legal_description,
    noip.map_area_hectares,
    op.area_size,
    noip.pid,
    op.pid,
    noip.pin,
    op.pin,
    noip.purchased_date AT TIME ZONE 'UTC',
    osp.purchase_date,
    noip.ownership_type_code,
    gopi.property_owner_type_code,
    noip.oats_subject_property_id,
    osp.subject_property_id
FROM parcels_to_insert pti
    JOIN oats.oats_subject_properties osp ON osp.subject_property_id = pti.subject_property_id
    JOIN oats.oats_properties op ON op.property_id = osp.property_id
    LEFT JOIN grouped_oats_property_interests_ids gopi ON gopi.subject_property_id = pti.subject_property_id
    JOIN alcs.notice_of_intent_parcel noip ON noip.oats_subject_property_id = pti.subject_property_id
WHERE noip.alr_area != osp.alr_area
    OR (noip.civic_address != op.civic_address)
    OR (noip.is_farm != osp.farm_land_ind::bool)
    OR (noip.legal_description != op.legal_description)
    OR (noip.map_area_hectares != op.area_size)
    OR (noip.pid != op.pid::text)
    OR (noip.pin != op.pin::text)
    OR (
        noip.purchased_date != osp.purchase_date AT TIME ZONE 'America/Vancouver'
    )
    OR (
        noip.oats_subject_property_id != osp.subject_property_id
    );