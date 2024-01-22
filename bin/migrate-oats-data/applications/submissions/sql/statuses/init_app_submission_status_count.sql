WITH app_components_grouped AS (
    SELECT oaa.alr_application_id
    FROM oats.alcs_etl_applications_nois oaa
    WHERE oaa.application_class_code IN ('LOA', 'BLK', 'SCH', 'NAN')
        and oaa.alr_change_code <> 'SRW'
),
alcs_submissions_with_statuses AS (
    SELECT apps.file_number
    FROM alcs.application_submission apps
        JOIN alcs.application_submission_to_submission_status apstss ON apps.uuid = apstss.submission_uuid
    GROUP BY apps.file_number
),
-- alcs_submissions_with_statuses is required for developement environment only. Production environment does not have submissions.
alcs_submission_uuids_to_populate AS (
    SELECT oaa.alr_application_id,
        apps.uuid
    FROM app_components_grouped
        JOIN oats.oats_alr_applications oaa ON app_components_grouped.alr_application_id = oaa.alr_application_id
        JOIN alcs.application_submission apps ON oaa.alr_application_id::TEXT = apps.file_number -- make sure TO WORK ONLY with the ones that were imported TO ALCS
        LEFT JOIN alcs_submissions_with_statuses ON alcs_submissions_with_statuses.file_number = apps.file_number
    WHERE alcs_submissions_with_statuses.file_number IS NULL -- filter out all submissons that have statuses populated before the ETL;
)
SELECT count(*)
FROM alcs_submission_uuids_to_populate
    CROSS JOIN alcs.application_submission_status_type apsst