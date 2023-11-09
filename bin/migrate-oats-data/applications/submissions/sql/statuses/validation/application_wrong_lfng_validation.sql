--- run it manually in IDE of your choice
--- compare to numbers returned by script.
-- total count of set 'WRNG' - Wrong LFNG in ALCS
SELECT
    count(*)
FROM
    alcs.application_submission_to_submission_status appstss
    JOIN alcs.application_submission as2 ON as2.uuid = appstss.submission_uuid
WHERE
    appstss.status_type_code = 'WRNG'
    AND effective_date IS NOT NULL
    AND as2.audit_created_by = 'oats_etl';

--total count of set 'WLG' apps in OATS 
WITH
    last_wrong_per_file_number AS (
        SELECT
            alr_application_id,
            accomplishment_code,
            MAX(oa.completion_date) AS completion_date
        FROM
            oats.oats_accomplishments oa
        WHERE
            accomplishment_code = 'WLG'
        GROUP BY
            alr_application_id,
            accomplishment_code
    ),
    lfng_wrong_accomplishments_for_app_only AS (
        SELECT
            last_wlg.accomplishment_code,
            last_wlg.completion_date,
            oaa.alr_application_id
        FROM
            oats.oats_alr_applications oaa
            LEFT JOIN last_wrong_per_file_number AS last_wlg ON last_wlg.alr_application_id = oaa.alr_application_id
        WHERE
            oaa.application_class_code IN ('LOA', 'BLK')
    ),
    all_wlg AS (
        SELECT
            oats_lfng_wlg.alr_application_id,
            oats_lfng_wlg.accomplishment_code,
            oats_lfng_wlg.completion_date AS max_date,
            apps.uuid
        FROM
            lfng_wrong_accomplishments_for_app_only oats_lfng_wlg
            JOIN alcs.application_submission apps ON apps.file_number = oats_lfng_wlg.alr_application_id::TEXT
        WHERE
            oats_lfng_wlg.accomplishment_code = 'WLG'
            and oats_lfng_wlg.completion_date IS NOT NULL
    )
SELECT
    COUNT(*)
FROM
    all_wlg