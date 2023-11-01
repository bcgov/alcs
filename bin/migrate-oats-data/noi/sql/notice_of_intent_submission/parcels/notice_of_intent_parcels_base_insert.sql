WITH parcels_to_insert AS (
    SELECT TRUE AS is_confirmed_by_applicant,
        nois.uuid,
        'oats_etl' AS audit_created_by,
        osp.subject_property_id
    FROM alcs.notice_of_intent_submission nois
        JOIN oats.oats_subject_properties osp ON osp.alr_application_id = nois.file_number::INTEGER
)
SELECT uuid AS notice_of_intent_submission_uuid,
    audit_created_by,
    is_confirmed_by_applicant,
    subject_property_id
FROM parcels_to_insert as noip