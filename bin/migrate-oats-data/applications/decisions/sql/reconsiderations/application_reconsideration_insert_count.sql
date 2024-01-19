WITH alcs_reconsiderations_resulting_decisions AS (
    SELECT appr."uuid",
        appr.submitted_date::DATE AS submitted_date,
        appd.resolution_number,
        appd.resolution_year,
        appd.oats_alr_appl_decision_id
    FROM alcs.application_reconsideration appr
        JOIN alcs.application_decision appd ON appd.reconsiders_uuid = appr."uuid"
        JOIN alcs.application app ON app."uuid" = appr.application_uuid
)
SELECT count(*)
FROM oats.oats_reconsideration_requests orr
    JOIN oats.oats_alr_appl_decisions oaad ON oaad.reconsideration_request_id = orr.reconsideration_request_id
    JOIN alcs.application app ON app.file_number = oaad.alr_application_id::TEXT
    OR app.file_number = orr.alr_application_id::TEXT -- this IS required to get oats_recons only for apps
    LEFT JOIN alcs_reconsiderations_resulting_decisions AS amrd ON amrd.oats_alr_appl_decision_id = oaad.alr_appl_decision_id
    AND amrd.submitted_date = orr.received_date::DATE
WHERE amrd."uuid" IS NULL