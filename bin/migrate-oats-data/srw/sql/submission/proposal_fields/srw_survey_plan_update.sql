SELECT DISTINCT
    ON (ns.file_number::INTEGER) nd.type_code,
    ns.has_survey_plan,
    nd.oats_application_id::INTEGER
FROM
    alcs.notification_submission ns
    JOIN alcs.notification_document nd ON ns.file_number = nd.oats_application_id::TEXT
WHERE
    nd.type_code IN ('SRWP', 'SURV')
    AND ns.has_survey_plan IS False