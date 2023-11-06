WITH latest_in_progress_accomplishment_per_file_number AS (
    SELECT alr_application_id,
        accomplishment_code,
        min(oa.completion_date) AS completion_date
    FROM oats.oats_accomplishments oa
    WHERE accomplishment_code = 'INP'
    GROUP BY alr_application_id,
        accomplishment_code
),
latest_in_progress_accomplishments_for_app_only AS (
    SELECT DISTINCT ON (
            latest_in_prog.accomplishment_code,
            latest_in_prog.completion_date,
            oaa.alr_application_id,
            oaa.created_date,
            oaa.submitted_to_alc_date,
            oaa.when_created
        ) latest_in_prog.accomplishment_code,
        latest_in_prog.completion_date,
        oaa.alr_application_id,
        oaa.created_date,
        oaa.submitted_to_alc_date,
        oaa.when_created
    FROM oats.oats_alr_applications oaa
        LEFT JOIN latest_in_progress_accomplishment_per_file_number AS latest_in_prog ON latest_in_prog.alr_application_id = oaa.alr_application_id
    WHERE oaa.application_class_code IN ('LOA', 'BLK')
),
submission_statuses_to_update AS (
    SELECT count(*)
    FROM alcs.application_submission_to_submission_status appstss
        JOIN alcs.application_submission apps ON apps.uuid = appstss.submission_uuid
        JOIN latest_in_progress_accomplishments_for_app_only AS oats_in_prog ON oats_in_prog.alr_application_id::TEXT = apps.file_number
    GROUP BY appstss.submission_uuid
)
SELECT count(*)
FROM submission_statuses_to_update