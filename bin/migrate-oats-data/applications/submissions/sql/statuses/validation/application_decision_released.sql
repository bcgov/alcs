--- run it manually in IDE of your choice
--- compare to numbers returned by script. They should match
-- total count of set 'ALCD' - Decision Released
SELECT
    count(*)
FROM
    alcs.application_submission_to_submission_status appstss
WHERE
    appstss.effective_date IS NOT NULL
    AND status_type_code = 'ALCD';

-- total count of expected 'ALCD' - Decision Released
SELECT
    count(*)
FROM
    alcs.application app
    JOIN alcs.application_submission apps ON app.file_number = apps.file_number
WHERE
    app.decision_date IS NOT NULL