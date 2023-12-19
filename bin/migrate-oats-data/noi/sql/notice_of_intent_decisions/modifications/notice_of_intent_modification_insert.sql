WITH alcs_modifications_resulting_decisions AS (
    SELECT noim."uuid",
        noim.submitted_date::DATE AS submitted_date,
        noid.resolution_number,
        noid.resolution_year,
        noid.oats_alr_appl_decision_id
    FROM alcs.notice_of_intent_modification noim
        JOIN alcs.notice_of_intent_decision noid ON noid.modifies_uuid = noim."uuid"
        JOIN alcs.notice_of_intent noi ON noi."uuid" = noim.notice_of_intent_uuid
)
SELECT orr.reconsideration_request_id,
    orr.received_date,
    orr.approved_date,
    noi."uuid" AS noi_uuid,
    orr.description
FROM oats.oats_reconsideration_requests orr
    JOIN oats.oats_alr_appl_decisions oaad ON oaad.reconsideration_request_id = orr.reconsideration_request_id
    JOIN alcs.notice_of_intent noi ON noi.file_number = oaad.alr_application_id::TEXT
    OR noi.file_number = orr.alr_application_id::TEXT -- this IS requireed TO GET oats_recons ONLY FOR nois
    LEFT JOIN alcs_modifications_resulting_decisions AS amrd ON amrd.oats_alr_appl_decision_id = oaad.alr_appl_decision_id
    AND amrd.submitted_date = orr.received_date::DATE
WHERE amrd."uuid" IS NULL