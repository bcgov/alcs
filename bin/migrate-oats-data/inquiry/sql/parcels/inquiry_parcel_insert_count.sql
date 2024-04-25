WITH parcels_to_insert AS (
    SELECT i.uuid,
        osp.subject_property_id
    FROM alcs.inquiry i
        JOIN oats.oats_subject_properties osp ON osp.issue_id = i.file_number::bigint
)
SELECT COUNT(*)
FROM parcels_to_insert pti
    JOIN oats.oats_subject_properties osp ON osp.subject_property_id = pti.subject_property_id
    JOIN oats.oats_properties op ON op.property_id = osp.property_id