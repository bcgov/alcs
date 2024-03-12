WITH latest_in_progress_accomplishment_per_file_number AS (
    SELECT alr_application_id,
        accomplishment_code,
        min(oa.completion_date) AS completion_date
    FROM oats.oats_accomplishments oa
    WHERE accomplishment_code = 'INP'
    GROUP BY alr_application_id,
        accomplishment_code
),
latest_in_progress_accomplishments_for_srw_only AS (
    SELECT DISTINCT ON (
            latest_in_prog.accomplishment_code,
            latest_in_prog.completion_date,
            oaa.alr_application_id,
            oaa.created_date,
            oaa.submitted_to_alc_date,
            oaa.when_created
        ) latest_in_prog.accomplishment_code,
        latest_in_prog.completion_date,
        oaa.alr_application_id,
        oaa.created_date,
        oaa.submitted_to_alc_date,
        oaa.when_created
    FROM oats.oats_alr_applications oaa
        LEFT JOIN latest_in_progress_accomplishment_per_file_number AS latest_in_prog ON latest_in_prog.alr_application_id = oaa.alr_application_id
        JOIN oats.oats_alr_appl_components oaac ON oaa.alr_application_id = oaac.alr_application_id
    WHERE oaa.application_class_code IN ('LOA', 'BLK', 'SCH', 'NAN') AND oaac.alr_change_code IN('SRW')
),
submission_statuses_to_update AS (
    SELECT count(*)
    FROM alcs.notification_submission_to_submission_status notstss
        JOIN alcs.notification_submission nots ON nots.uuid = notstss.submission_uuid
        JOIN latest_in_progress_accomplishments_for_srw_only AS oats_in_prog ON oats_in_prog.alr_application_id::TEXT = nots.file_number
    GROUP BY notstss.submission_uuid
)
SELECT count(*)
FROM submission_statuses_to_update;