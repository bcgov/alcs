WITH first_cancelled_accomplishment_per_file_number AS (
    SELECT alr_application_id,
        accomplishment_code,
        min(oa.completion_date) AS completion_date
    FROM oats.oats_accomplishments oa
    WHERE accomplishment_code = 'CAN'
    GROUP BY alr_application_id,
        accomplishment_code
),
cancelled_accomplishments_for_srw_only AS (
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
        JOIN oats.oats_alr_appl_components oaac ON oaa.alr_application_id = oaac.alr_application_id
    WHERE oaa.application_class_code IN ('LOA', 'BLK', 'SCH', 'NAN') AND oaac.alr_change_code IN('SRW')
),
all_nots_with_cancelled_status AS (
    SELECT oats_cancelled.alr_application_id
    FROM cancelled_accomplishments_for_srw_only oats_cancelled
        JOIN alcs.notification_submission nots ON nots.file_number = oats_cancelled.alr_application_id::TEXT
        JOIN alcs.notification_submission_to_submission_status notstss ON notstss.submission_uuid = nots.uuid
    WHERE oats_cancelled.completion_date IS NOT NULL
        OR oats_cancelled.cancelled_date IS NOT NULL
    GROUP BY oats_cancelled.alr_application_id
)
SELECT count(*)
FROM all_nots_with_cancelled_status;