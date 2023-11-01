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
)
SELECT oats_cancelled.alr_application_id,
    oats_cancelled.accomplishment_code,
    oats_cancelled.completion_date,
    oats_cancelled.cancelled_date,
    LEAST(
        COALESCE(
            oats_cancelled.completion_date,
            oats_cancelled.cancelled_date
        ),
        COALESCE(
            oats_cancelled.cancelled_date,
            oats_cancelled.completion_date
        )
    ) AS min_date,
    apps.uuid
FROM cancelled_accomplishments_for_app_only oats_cancelled
    JOIN alcs.application_submission apps ON apps.file_number = oats_cancelled.alr_application_id::TEXT
WHERE (
        oats_cancelled.completion_date IS NOT NULL
        OR oats_cancelled.cancelled_date IS NOT NULL
    )