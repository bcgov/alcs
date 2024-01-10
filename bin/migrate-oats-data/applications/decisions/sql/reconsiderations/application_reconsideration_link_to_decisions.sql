SELECT appr."uuid" as reconsideration_uuid,
    appd."uuid" as decision_uuid,
    orr.reconsideration_request_id
FROM oats.oats_reconsideration_requests orr
    JOIN oats.oats_alr_appl_decisions oaad ON oaad.reconsideration_request_id = orr.reconsideration_request_id
    JOIN alcs.application_decision appd ON appd.oats_alr_appl_decision_id = oaad.alr_appl_decision_id
    JOIN alcs.application_reconsideration appr ON appr.oats_reconsideration_request_id = orr.reconsideration_request_id
WHERE appd.reconsiders_uuid IS NULL