SELECT nois.fill_project_duration,
    nois.file_number,
    nois.file_number::BIGINT AS file_id
FROM alcs.notice_of_intent_submission nois
WHERE nois.type_code IN ('POFO', 'ROSO')
    AND nois.audit_created_by = 'oats_etl'
    AND nois.fill_project_duration IS NOT NULL