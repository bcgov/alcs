WITH earliest_in_progress_accomplishment_per_file_number AS (
    SELECT alr_application_id,
        accomplishment_code,
        min(oa.completion_date) AS completion_date
    FROM oats.oats_accomplishments oa
    WHERE accomplishment_code = 'INP'
    GROUP BY alr_application_id,
        accomplishment_code
),
earliest_in_progress_accomplishments_for_srw_only AS (
    SELECT DISTINCT ON (
            earliest_in_prog.accomplishment_code,
            earliest_in_prog.completion_date,
            oaa.alr_application_id,
            oaa.created_date,
            oaa.submitted_to_alc_date,
            oaa.when_created
        ) earliest_in_prog.accomplishment_code,
        earliest_in_prog.completion_date,
        oaa.alr_application_id,
        oaa.created_date,
        oaa.submitted_to_alc_date,
        oaa.when_created
    FROM oats.oats_alr_applications oaa
        LEFT JOIN earliest_in_progress_accomplishment_per_file_number AS earliest_in_prog ON earliest_in_prog.alr_application_id = oaa.alr_application_id
        JOIN oats.oats_alr_appl_components oaac ON oaa.alr_application_id = oaac.alr_application_id
    WHERE oaa.application_class_code IN ('LOA', 'BLK', 'SCH', 'NAN') AND oaac.alr_change_code IN('SRW')
)
SELECT DISTINCT ON (oats_in_prog.alr_application_id) oats_in_prog.alr_application_id,
    oats_in_prog.accomplishment_code,
    oats_in_prog.completion_date,
    oats_in_prog.created_date,
    oats_in_prog.submitted_to_alc_date,
    oats_in_prog.when_created,
    nots.uuid
FROM alcs.notification_submission_to_submission_status notss
    JOIN alcs.notification_submission nots ON nots.uuid = notss.submission_uuid
    JOIN earliest_in_progress_accomplishments_for_srw_only AS oats_in_prog ON oats_in_prog.alr_application_id::TEXT = nots.file_number