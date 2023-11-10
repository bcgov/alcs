SELECT
    nois.fill_project_duration_unit,
    nois.fill_project_duration_amount,
    nois.file_number,
    nois.file_number::INTEGER AS file_id
FROM
    alcs.notice_of_intent_submission nois
WHERE
    nois.type_code IN ('POFO', 'ROSO') AND nois.audit_created_by = 'oats_etl' AND nois.fill_project_duration_amount IS NOT NULL