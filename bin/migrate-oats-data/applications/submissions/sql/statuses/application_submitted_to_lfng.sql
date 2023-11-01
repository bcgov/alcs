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
)
SELECT oats_sub_lg.alr_application_id,
    oats_sub_lg.accomplishment_code,
    oats_sub_lg.completion_date,
    oats_sub_lg.submitted_to_lg_date,
    GREATEST(
        COALESCE(
            oats_sub_lg.completion_date,
            oats_sub_lg.submitted_to_lg_date
        ),
        COALESCE(
            oats_sub_lg.submitted_to_lg_date,
            oats_sub_lg.completion_date
        )
    ) AS max_date,
    apps.uuid
FROM submitted_lg_accomplishments_for_app_only oats_sub_lg
    JOIN alcs.application_submission apps ON apps.file_number = oats_sub_lg.alr_application_id::TEXT
WHERE (
        oats_sub_lg.completion_date IS NOT NULL 
        OR oats_sub_lg.submitted_to_lg_date IS NOT NULL
    )