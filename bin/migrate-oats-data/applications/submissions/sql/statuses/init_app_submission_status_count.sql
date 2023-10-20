WITH noi_components_grouped AS (
    SELECT oaac.alr_application_id
    FROM oats.oats_alr_appl_components oaac
        JOIN oats.oats_alr_applications oaa ON oaa.alr_application_id = oaac.alr_application_id
    WHERE oaa.application_class_code = 'NOI'
    GROUP BY oaac.alr_application_id
    HAVING count(oaac.alr_application_id) < 2 -- ignore notice of intents with multiple components
),
alcs_submissions_with_statuses AS (
    SELECT nois.file_number
    FROM alcs.notice_of_intent_submission nois
        JOIN alcs.notice_of_intent_submission_to_submission_status noistss ON nois.uuid = noistss.submission_uuid
    GROUP BY nois.file_number
),
-- alcs_submissions_with_statuses is required for developement environment only. Production environment does not have submissions.
alcs_submission_uuids_to_populate AS (
    SELECT oaa.alr_application_id,
        nois.uuid
    FROM noi_components_grouped
        JOIN oats.oats_alr_applications oaa ON noi_components_grouped.alr_application_id = oaa.alr_application_id
        JOIN alcs.notice_of_intent_submission nois ON oaa.alr_application_id::TEXT = nois.file_number -- make sure TO WORK ONLY with the ones that were imported TO ALCS
        LEFT JOIN alcs_submissions_with_statuses ON alcs_submissions_with_statuses.file_number = nois.file_number
    WHERE alcs_submissions_with_statuses.file_number IS NULL -- filter out all submissons that have statuses populated before the ETL;
)
SELECT count(*)
FROM alcs_submission_uuids_to_populate
    CROSS JOIN alcs.notice_of_intent_submission_status_type noisst