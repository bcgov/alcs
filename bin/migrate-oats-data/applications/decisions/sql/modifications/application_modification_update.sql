WITH alcs_modifications_resulting_decisions AS (
    SELECT appm."uuid" AS modification_uuid,
        appm.submitted_date::DATE AS submitted_date,
        appd.resolution_number,
        appd.resolution_year,
        appd.oats_alr_appl_decision_id,
        appm.audit_created_by
    FROM alcs.application_modification appm
        JOIN alcs.application_decision appd ON appd.modifies_uuid = appm."uuid"
        JOIN alcs.application app ON app."uuid" = appm.application_uuid
)
SELECT orr.reconsideration_request_id,
    orr.received_date,
    orr.approved_date,
    app."uuid" AS app_uuid,
    orr.description,
    amrd.modification_uuid
FROM oats.oats_reconsideration_requests orr
    JOIN oats.oats_alr_appl_decisions oaad ON oaad.reconsideration_request_id = orr.reconsideration_request_id
    JOIN alcs.application app ON app.file_number = oaad.alr_application_id::TEXT
    OR app.file_number = orr.alr_application_id::TEXT -- this is required to get oats_recons only for apps
    JOIN alcs_modifications_resulting_decisions AS amrd ON amrd.oats_alr_appl_decision_id = oaad.alr_appl_decision_id
    AND amrd.submitted_date = orr.received_date::DATE -- this will make sure that only modifications that exist in oats will be selected
WHERE amrd.audit_created_by <> 'oats_etl'