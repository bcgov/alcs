SELECT count(*)
FROM oats.oats_reconsideration_requests orr
    JOIN oats.oats_alr_appl_decisions oaad ON oaad.reconsideration_request_id = orr.reconsideration_request_id
    JOIN alcs.notice_of_intent_decision noid ON noid.oats_alr_appl_decision_id = oaad.alr_appl_decision_id
    JOIN alcs.notice_of_intent_modification noim ON noim.oats_reconsideration_request_id = orr.reconsideration_request_id
WHERE noid.modifies_uuid IS NULL;