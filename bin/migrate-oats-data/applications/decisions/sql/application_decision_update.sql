SELECT oa.accomplishment_code,
    ad."uuid" as decision_uuid,
    ad.oats_alr_appl_decision_id
FROM oats.oats_accomplishments oa
    JOIN alcs.application a ON a.file_number = oa.alr_application_id::TEXT
    JOIN alcs.application_decision ad ON ad.application_uuid = a."uuid"
WHERE oa.accomplishment_code IN ('ACD', 'LGD', 'OGD', 'PGD', 'ALD')
    AND ad.audit_created_by = 'oats_etl'