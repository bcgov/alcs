SELECT
    COUNT(*)
FROM
    alcs.card
WHERE
    audit_created_by = 'oats_etl'
    AND type_code = 'PLAN'