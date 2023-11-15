SELECT
    count(*)
FROM
    alcs.notice_of_intent_submission nois
WHERE
    nois.type_code IN ('POFO', 'ROSO')
    AND nois.fill_project_duration_amount IS NOT NULL
    AND nois.audit_created_by = 'oats_etl'