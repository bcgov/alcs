UPDATE alcs.notice_of_intent_submission_to_submission_status AS noi_statuses
SET effective_date = noi.date_received_all_items
FROM alcs.notice_of_intent AS noi
    JOIN alcs.notice_of_intent_submission nois ON nois.file_number = noi.file_number
WHERE nois.uuid = noi_statuses.submission_uuid
    AND noi_statuses.status_type_code = 'RECA'
    AND noi.date_received_all_items IS NOT NULL;