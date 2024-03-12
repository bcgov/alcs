INSERT INTO alcs.notification_submission_to_submission_status(submission_uuid, status_type_code) -- retrieve applications from OATS that have only 1 proposal component
    WITH components_grouped AS (
        SELECT aes.alr_application_id
        FROM oats.alcs_etl_srw aes
        WHERE aes.application_class_code IN ('LOA', 'BLK', 'SCH', 'NAN')
            and aes.alr_change_code = 'SRW'
    ),
    alcs_submissions_with_statuses AS (
        SELECT not_sub.file_number
        FROM alcs.notification_submission not_sub
            JOIN alcs.notification_submission_to_submission_status notss ON not_sub.uuid = notss.submission_uuid
        GROUP BY not_sub.file_number
    ),
    -- retrieve submission_uuid from ALCS that were imported with ETL
    alcs_submission_uuids_to_populate AS (
        SELECT oaa.alr_application_id,
            notss.uuid
        FROM components_grouped
            JOIN oats.oats_alr_applications oaa ON components_grouped.alr_application_id = oaa.alr_application_id
            JOIN alcs.notification_submission notss ON oaa.alr_application_id::TEXT = notss.file_number -- make sure TO WORK ONLY with the ones that were imported TO ALCS
            LEFT JOIN alcs_submissions_with_statuses ON alcs_submissions_with_statuses.file_number = notss.file_number
        WHERE alcs_submissions_with_statuses.file_number IS NULL -- filter out all submissions that have statuses populated before the ETL;
    )
SELECT uuid,
    notsst.code
FROM alcs_submission_uuids_to_populate
    CROSS JOIN alcs.notification_submission_status_type notsst