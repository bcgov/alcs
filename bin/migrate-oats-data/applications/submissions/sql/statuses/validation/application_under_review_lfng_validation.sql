--- run it manually in IDE of your choice
--- compare to numbers returned by script.
-- total count of set 'REVG' - Under Review by LFNG in ALCS
SELECT
    count(*)
FROM
    alcs.application_submission_to_submission_status appstss
    JOIN alcs.application_submission as2 ON as2.uuid = appstss.submission_uuid
WHERE
    appstss.status_type_code = 'REVG'
    AND effective_date IS NOT NULL
    AND as2.audit_created_by = 'oats_etl';

--total count of set 'ULG' apps in OATS 
WITH
    last_review_per_file_number AS (
        SELECT
            alr_application_id,
            accomplishment_code,
            MAX(oa.completion_date) AS completion_date
        FROM
            oats.oats_accomplishments oa
        WHERE
            accomplishment_code = 'ULG'
        GROUP BY
            alr_application_id,
            accomplishment_code
    ),
    lfng_rev_accomplishments_for_app_only AS (
        SELECT
            last_rev.accomplishment_code,
            last_rev.completion_date,
            oaa.alr_application_id
        FROM
            oats.oats_alr_applications oaa
            LEFT JOIN last_review_per_file_number AS last_rev ON last_rev.alr_application_id = oaa.alr_application_id
        WHERE
            oaa.application_class_code IN ('LOA', 'BLK')
    ),
    all_under_rev AS (
        SELECT
            oats_lfng_rev.alr_application_id,
            oats_lfng_rev.accomplishment_code,
            oats_lfng_rev.completion_date AS max_date,
            apps.uuid
        FROM
            lfng_rev_accomplishments_for_app_only oats_lfng_rev
            JOIN alcs.application_submission apps ON apps.file_number = oats_lfng_rev.alr_application_id::TEXT
        WHERE
            oats_lfng_rev.accomplishment_code = 'ULG'
            and oats_lfng_rev.completion_date IS NOT NULL
    )
SELECT
    COUNT(*)
FROM
    all_under_rev