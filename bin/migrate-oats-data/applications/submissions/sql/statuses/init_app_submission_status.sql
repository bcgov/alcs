INSERT INTO alcs.application_submission_to_submission_status(submission_uuid, status_type_code) -- retrieve Notice of Intents from OATS that have only 1 proposal component
    WITH application_components_grouped AS (
        SELECT oaac.alr_application_id
        FROM oats.oats_alr_appl_components oaac
            JOIN oats.oats_alr_applications oaa ON oaa.alr_application_id = oaac.alr_application_id
        WHERE oaa.application_class_code IN ('LOA', 'BLK')
        GROUP BY oaac.alr_application_id
        HAVING count(oaac.alr_application_id) < 2 -- ignore notice of intents with multiple components
    ),
    -- alcs_submissions_with_statuses is required for development environment only. Production environment does not have submissions.
    alcs_submissions_with_statuses AS (
        SELECT app_sub.file_number
        FROM alcs.application_submission app_sub
            JOIN alcs.application_submission_to_submission_status appss ON app_sub.uuid = appss.submission_uuid
        GROUP BY app_sub.file_number
    ),
    -- retrieve submission_uuid from ALCS that were imported with ETL
    alcs_submission_uuids_to_populate AS (
        SELECT oaa.alr_application_id,
            nois.uuid
        FROM noi_components_grouped
            JOIN oats.oats_alr_applications oaa ON noi_components_grouped.alr_application_id = oaa.alr_application_id
            JOIN alcs.notice_of_intent_submission nois ON oaa.alr_application_id::TEXT = nois.file_number -- make sure TO WORK ONLY with the ones that were imported TO ALCS
            LEFT JOIN alcs_submissions_with_statuses ON alcs_submissions_with_statuses.file_number = nois.file_number
        WHERE alcs_submissions_with_statuses.file_number IS NULL -- filter out all submissions that have statuses populated before the ETL;
    )
SELECT uuid,
    noisst.code
FROM alcs_submission_uuids_to_populate
    CROSS JOIN alcs.notice_of_intent_submission_status_type noisst