WITH last_review_per_file_number AS (
    SELECT alr_application_id,
        accomplishment_code,
        MAX(oa.completion_date) AS completion_date
    FROM oats.oats_accomplishments oa
    WHERE accomplishment_code = 'ULG'
    GROUP BY alr_application_id,
        accomplishment_code
),
lfng_rev_accomplishments_for_app_only AS (
    SELECT last_rev.accomplishment_code,
        last_rev.completion_date,
        oaa.alr_application_id
    FROM oats.oats_alr_applications oaa
        LEFT JOIN last_review_per_file_number AS last_rev ON last_rev.alr_application_id = oaa.alr_application_id
    WHERE oaa.application_class_code IN ('LOA', 'BLK')
)
SELECT count(*)
FROM lfng_rev_accomplishments_for_app_only oats_lfng_rev
    JOIN alcs.application_submission apps ON apps.file_number = oats_lfng_rev.alr_application_id::TEXT
   	WHERE oats_lfng_rev.accomplishment_code = 'ULG'
