SELECT
    count(*)
FROM
    alcs.application_submission_to_submission_status app_statuses
WHERE
    app_statuses.status_type_code = 'RECA';