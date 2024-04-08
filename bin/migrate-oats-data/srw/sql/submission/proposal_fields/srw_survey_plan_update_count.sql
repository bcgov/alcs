WITH
    update_count AS (
        SELECT DISTINCT
            ON (ns.file_number) nd.type_code,
            ns.has_survey_plan,
            nd.oats_application_id
        FROM
            alcs.notification_submission ns
            JOIN alcs.notification_document nd ON ns.file_number = nd.oats_application_id::TEXT
        WHERE
            nd.type_code IN ('SRWP', 'SURV')
            AND ns.has_survey_plan IS False
    )
SELECT
    COUNT(*)
FROM
    update_count;