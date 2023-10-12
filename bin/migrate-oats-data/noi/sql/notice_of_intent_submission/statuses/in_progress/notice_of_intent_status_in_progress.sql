WITH latest_in_progress_accomplishment_per_file_number AS (
    SELECT alr_application_id, accomplishment_code, min(oa.completion_date) AS completion_date
    FROM oats.oats_accomplishments oa
    WHERE accomplishment_code = 'INP'
    GROUP BY alr_application_id, accomplishment_code
),
latest_in_progress_accomplishments_for_noi_only AS (
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
    WHERE oaa.application_class_code = 'NOI'
)
SELECT DISTINCT ON (oats_in_prog.alr_application_id) oats_in_prog.alr_application_id,
    oats_in_prog.accomplishment_code,
    oats_in_prog.completion_date,
    oats_in_prog.created_date,
    oats_in_prog.submitted_to_alc_date,
    oats_in_prog.when_created,
    nois.uuid
FROM alcs.notice_of_intent_submission_to_submission_status noistss
    JOIN alcs.notice_of_intent_submission nois ON nois.uuid = noistss.submission_uuid
    JOIN latest_in_progress_accomplishments_for_noi_only AS oats_in_prog ON oats_in_prog.alr_application_id::TEXT = nois.file_number
    