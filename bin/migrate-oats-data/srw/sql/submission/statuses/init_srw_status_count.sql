WITH components_grouped AS (
    SELECT aes.alr_application_id
    FROM oats.alcs_etl_srw aes
    WHERE aes.application_class_code IN ('LOA', 'BLK', 'SCH', 'NAN')
        and aes.alr_change_code = 'SRW'
),
alcs_submissions_with_statuses AS (
    SELECT nots.file_number
    FROM alcs.notification_submission nots
        JOIN alcs.notification_submission_to_submission_status notss ON nots.uuid = notss.submission_uuid
    GROUP BY nots.file_number
),
-- alcs_submissions_with_statuses is required for development environment only. Production environment does not have submissions.
alcs_submission_uuids_to_populate AS (
    SELECT oaa.alr_application_id,
        nots.uuid
    FROM components_grouped
        JOIN oats.oats_alr_applications oaa ON components_grouped.alr_application_id = oaa.alr_application_id
        JOIN alcs.notification_submission nots ON oaa.alr_application_id::TEXT = nots.file_number -- make sure TO WORK ONLY with the ones that were imported TO ALCS
        LEFT JOIN alcs_submissions_with_statuses ON alcs_submissions_with_statuses.file_number = nots.file_number
    WHERE alcs_submissions_with_statuses.file_number IS NULL -- filter out all submissions that have statuses populated before the ETL;
)
SELECT count(*)
FROM alcs_submission_uuids_to_populate
    CROSS JOIN alcs.notification_submission_status_type notsst