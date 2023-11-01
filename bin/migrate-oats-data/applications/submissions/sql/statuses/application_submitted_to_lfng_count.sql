WITH submitted_accomplishment_per_file_number AS (
    SELECT alr_application_id,
        accomplishment_code,
        max(oa.completion_date) AS completion_date
    FROM oats.oats_accomplishments oa
    WHERE accomplishment_code = 'SLG'
    GROUP BY alr_application_id,
        accomplishment_code
),
submitted_lg_accomplishments_for_app_only AS (
    SELECT DISTINCT ON (
            last_sub.accomplishment_code,
            last_sub.completion_date,
            oaa.alr_application_id,
            oaa.submitted_to_lg_date
        ) last_sub.accomplishment_code,
        last_sub.completion_date,
        oaa.alr_application_id,
        oaa.submitted_to_lg_date
    FROM oats.oats_alr_applications oaa
        LEFT JOIN submitted_accomplishment_per_file_number AS last_sub ON last_sub.alr_application_id = oaa.alr_application_id
    WHERE oaa.application_class_code IN ('LOA', 'BLK')
),
    all_apps_with_slg_status AS (
    SELECT oats_slg.alr_application_id
    FROM submitted_lg_accomplishments_for_app_only oats_slg
        JOIN alcs.application_submission apps ON apps.file_number = oats_slg.alr_application_id::TEXT
        JOIN alcs.application_submission_to_submission_status appstss ON appstss.submission_uuid = apps.uuid
    WHERE oats_slg.submitted_to_lg_date IS NOT NULL
        OR oats_slg.submitted_to_lg_date IS NOT NULL
    GROUP BY oats_slg.alr_application_id
)
SELECT count(*)
FROM all_apps_with_slg_status;