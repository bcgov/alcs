SELECT
    astss.effective_date,
    as2.file_number
FROM
    alcs.application_submission as2
    JOIN alcs.application_submission_to_submission_status astss ON as2."uuid" = astss.submission_uuid
WHERE
    astss.status_type_code = 'SUIN'
    AND astss.effective_date IS NOT NULL