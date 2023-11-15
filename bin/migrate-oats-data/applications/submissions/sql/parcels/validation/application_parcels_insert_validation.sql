-- Total count of inserted parcels should match total count of parcels in oats
-- Get total count of parcels in ALCS
SELECT count(*)
FROM alcs.application_parcel appp;
-- Get total count of parcels in OATS
WITH app_components_grouped AS (
    SELECT oaac.alr_application_id
    FROM oats.oats_alr_appl_components oaac
        JOIN oats.oats_alr_applications oaa ON oaa.alr_application_id = oaac.alr_application_id
    WHERE oaa.application_class_code IN ('LOA', 'BLK')
    GROUP BY oaac.alr_application_id
    HAVING count(oaac.alr_application_id) < 2 -- ignore applications with multiple components
)
SELECT count(*)
FROM app_components_grouped appg
    JOIN oats.oats_subject_properties osp ON osp.alr_application_id = appg.alr_application_id
    AND osp.alr_application_land_ind = 'Y';
-- return records that are different between OATS and ALCS
WITH parcels_to_insert AS (
    SELECT apps.uuid,
        osp.subject_property_id
    FROM alcs.application_submission apps
        JOIN oats.oats_subject_properties osp ON osp.alr_application_id = apps.file_number::bigint
),
grouped_oats_property_interests_ids AS (
    SELECT MIN(property_owner_type_code) AS property_owner_type_code,
        -- min will not affect anything since all property_owner_type_code are the same in scope of subject_property
        subject_property_id
    FROM oats.oats_property_interests opi
    GROUP BY opi.subject_property_id
) --- compares parcel fields and returns mismatches. Since oats has a lot of bad data ignore all records prior the 1900s
WITH parcels_to_insert AS (
    SELECT apps.uuid,
        osp.subject_property_id
    FROM alcs.application_submission apps
        JOIN oats.oats_subject_properties osp ON osp.alr_application_id = apps.file_number::bigint
),
grouped_oats_property_interests_ids AS (
    SELECT MIN(property_owner_type_code) AS property_owner_type_code,
        -- min will not affect anything since all property_owner_type_code are the same in scope of subject_property
        subject_property_id
    FROM oats.oats_property_interests opi
    GROUP BY opi.subject_property_id
) --- compares parcel fields and returns mismatches. Since oats has a lot of bad data ignore all records prior the 1900s
SELECT appp.alr_area,
    osp.alr_area,
    appp.civic_address,
    op.civic_address,
    appp.is_farm,
    osp.farm_land_ind,
    appp.legal_description,
    op.legal_description,
    appp.map_area_hectares,
    op.area_size,
    appp.pid,
    op.pid,
    appp.pin,
    op.pin,
    appp.purchased_date,
    osp.purchase_date,
    Date(
        appp.purchased_date AT TIME ZONE 'America/Vancouver'
    ) AS alcs_date,
    -- GET ONLY the date part
    Date(
        osp.purchase_date AT TIME ZONE 'America/Vancouver'
    ) AS oats_date,
    -- GET ONLY the date part
    appp.ownership_type_code,
    gopi.property_owner_type_code,
    appp.oats_subject_property_id,
    osp.subject_property_id
FROM parcels_to_insert pti
    JOIN oats.oats_subject_properties osp ON osp.subject_property_id = pti.subject_property_id
    JOIN oats.oats_properties op ON op.property_id = osp.property_id
    LEFT JOIN grouped_oats_property_interests_ids gopi ON gopi.subject_property_id = pti.subject_property_id
    JOIN alcs.application_parcel appp ON appp.oats_subject_property_id = pti.subject_property_id
WHERE appp.alr_area != osp.alr_area
    OR (appp.civic_address != op.civic_address)
    OR (appp.is_farm != osp.farm_land_ind::bool)
    OR (appp.legal_description != op.legal_description)
    OR (appp.map_area_hectares != op.area_size)
    OR (appp.pid != op.pid::text)
    OR (appp.pin != op.pin::text)
    OR (
        Date(
            appp.purchased_date AT TIME ZONE 'America/Vancouver'
        ) != Date(
            osp.purchase_date AT TIME ZONE 'America/Vancouver'
        )
    )
    OR (
        appp.oats_subject_property_id != osp.subject_property_id
    );