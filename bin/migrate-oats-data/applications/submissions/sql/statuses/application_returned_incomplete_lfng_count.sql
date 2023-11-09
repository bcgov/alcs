WITH last_lgi_per_file_number AS (
    SELECT alr_application_id,
        accomplishment_code,
        MAX(oa.completion_date) AS completion_date
    FROM oats.oats_accomplishments oa
    WHERE accomplishment_code = 'LGI'
    GROUP BY alr_application_id,
        accomplishment_code
),
returned_lfng_accomplishments_for_app_only AS (
    SELECT last_lgi.accomplishment_code,
        last_lgi.completion_date,
        oaa.alr_application_id
    FROM oats.oats_alr_applications oaa
        LEFT JOIN last_lgi_per_file_number AS last_lgi ON last_lgi.alr_application_id = oaa.alr_application_id
    WHERE oaa.application_class_code IN ('LOA', 'BLK')
)
SELECT count(*)
FROM returned_lfng_accomplishments_for_app_only oats_lfng_return
    JOIN alcs.application_submission apps ON apps.file_number = oats_lfng_return.alr_application_id::TEXT
   	WHERE oats_lfng_return.accomplishment_code = 'LGI'