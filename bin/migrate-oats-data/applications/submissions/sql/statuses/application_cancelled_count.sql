WITH first_cancelled_accomplishment_per_file_number AS (
    SELECT alr_application_id,
        accomplishment_code,
        min(oa.completion_date) AS completion_date
    FROM oats.oats_accomplishments oa
    WHERE accomplishment_code = 'CAN'
    GROUP BY alr_application_id,
        accomplishment_code
),
cancelled_accomplishments_for_app_only AS (
    SELECT DISTINCT ON (
            first_cancelled.accomplishment_code,
            first_cancelled.completion_date,
            oaa.alr_application_id,
            oaa.cancelled_date
        ) first_cancelled.accomplishment_code,
        first_cancelled.completion_date,
        oaa.alr_application_id,
        oaa.cancelled_date
    FROM oats.oats_alr_applications oaa
        LEFT JOIN first_cancelled_accomplishment_per_file_number AS first_cancelled ON first_cancelled.alr_application_id = oaa.alr_application_id
    WHERE oaa.application_class_code IN ('LOA', 'BLK')
),
all_apps_with_cancelled_status AS (
    SELECT oats_cancelled.alr_application_id
    FROM cancelled_accomplishments_for_app_only oats_cancelled
        JOIN alcs.application_submission apps ON apps.file_number = oats_cancelled.alr_application_id::TEXT
        JOIN alcs.application_submission_to_submission_status appstss ON appstss.submission_uuid = apps.uuid
    WHERE oats_cancelled.completion_date IS NOT NULL
        OR oats_cancelled.cancelled_date IS NOT NULL
    GROUP BY oats_cancelled.alr_application_id
)
SELECT count(*)
FROM all_apps_with_cancelled_status;