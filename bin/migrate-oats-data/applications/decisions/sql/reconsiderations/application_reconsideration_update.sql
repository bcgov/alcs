WITH alcs_reconsiderations_resulting_decisions AS (
    SELECT appr."uuid" AS reconsideration_uuid,
        appr.submitted_date::DATE AS submitted_date,
        appd.resolution_number,
        appd.resolution_year,
        appd.oats_alr_appl_decision_id,
        appr.audit_created_by
    FROM alcs.application_reconsideration appr
        JOIN alcs.application_decision appd ON appd.reconsiders_uuid = appr."uuid"
        JOIN alcs.application app ON app."uuid" = appr.application_uuid
)
SELECT orr.reconsideration_request_id,
    orr.received_date,
    orr.approved_date,
    app."uuid" AS app_uuid,
    orr.description,
    arrd.reconsideration_uuid,
    orr.new_proposal_ind,
    orr.new_information_ind,
    orr.error_information_ind
FROM oats.oats_reconsideration_requests orr
    JOIN oats.oats_alr_appl_decisions oaad ON oaad.reconsideration_request_id = orr.reconsideration_request_id
    JOIN alcs.application app ON app.file_number = oaad.alr_application_id::TEXT
    OR app.file_number = orr.alr_application_id::TEXT -- this is required to get oats_recons only for apps
    JOIN alcs_reconsiderations_resulting_decisions AS arrd ON arrd.oats_alr_appl_decision_id = oaad.alr_appl_decision_id
    AND arrd.submitted_date = orr.received_date::DATE -- this will make sure that only reconsiderations that exist in oats will be selected
WHERE arrd.audit_created_by <> 'oats_etl'