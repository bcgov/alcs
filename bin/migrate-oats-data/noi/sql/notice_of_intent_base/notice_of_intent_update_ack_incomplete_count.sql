SELECT
    COUNT(*)
FROM
    alcs.notice_of_intent_submission nois
    JOIN alcs.notice_of_intent_submission_to_submission_status noitss ON nois."uuid" = noitss.submission_uuid
WHERE
    noitss.status_type_code = 'SUIN'
    AND noitss.effective_date IS NOT NULL