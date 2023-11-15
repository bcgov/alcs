WITH last_wlg_per_file_number AS (
    SELECT alr_application_id,
        accomplishment_code,
        MAX(oa.completion_date) AS completion_date
    FROM oats.oats_accomplishments oa
    WHERE accomplishment_code = 'WLG'
    GROUP BY alr_application_id,
        accomplishment_code
),
wrong_lfng_accomplishments_for_app_only AS (
    SELECT last_wlg.accomplishment_code,
        last_wlg.completion_date,
        oaa.alr_application_id
    FROM oats.oats_alr_applications oaa
        LEFT JOIN last_wlg_per_file_number AS last_wlg ON last_wlg.alr_application_id = oaa.alr_application_id
    WHERE oaa.application_class_code IN ('LOA', 'BLK')
)
SELECT oats_lfng_wrong.alr_application_id,
    oats_lfng_wrong.accomplishment_code,
    oats_lfng_wrong.completion_date AS max_date,
    apps.uuid
FROM wrong_lfng_accomplishments_for_app_only oats_lfng_wrong
    JOIN alcs.application_submission apps ON apps.file_number = oats_lfng_wrong.alr_application_id::TEXT
   	WHERE oats_lfng_wrong.accomplishment_code = 'WLG'