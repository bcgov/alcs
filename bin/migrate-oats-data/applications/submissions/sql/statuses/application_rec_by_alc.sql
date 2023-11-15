UPDATE alcs.application_submission_to_submission_status AS app_statuses
SET
    effective_date = app.date_received_all_items
FROM
    alcs.application AS app
    JOIN alcs.application_submission apps ON apps.file_number = app.file_number
WHERE
    apps.uuid = app_statuses.submission_uuid
    AND app_statuses.status_type_code = 'RECA'
    AND app.date_received_all_items IS NOT NULL;