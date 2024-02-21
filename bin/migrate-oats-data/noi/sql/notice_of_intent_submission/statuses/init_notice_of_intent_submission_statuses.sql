INSERT INTO alcs.notice_of_intent_submission_to_submission_status(submission_uuid, status_type_code) -- retrieve Notice of Intents from OATS that have only 1 proposal component
    WITH noi_components_grouped AS (
        SELECT oaa.alr_application_id
        FROM oats.alcs_etl_applications_nois oaa
        WHERE oaa.application_class_code = 'NOI'
            and oaa.alr_change_code <> 'SRW'
    ),
    -- alcs_submissions_with_statuses is required for development environment only. Production environment does not have submissions.
    alcs_submissions_with_statuses AS (
        SELECT nois.file_number
        FROM alcs.notice_of_intent_submission nois
            JOIN alcs.notice_of_intent_submission_to_submission_status noistss ON nois.uuid = noistss.submission_uuid
        GROUP BY nois.file_number
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