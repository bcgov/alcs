--- run it manually in IDE of your choice
--- compare to numbers returned by script. They should match
-- total count of set 'RECA' - Received By ALC
SELECT count(*)
FROM alcs.notice_of_intent_submission_to_submission_status noistss
WHERE noistss.effective_date IS NOT NULL
    AND status_type_code = 'RECA';
-- total count of expected 'RECA' - SReceived By ALC
SELECT count(*)
FROM alcs.notice_of_intent noi
    JOIN alcs.notice_of_intent_submission nois ON noi.file_number = nois.file_number
WHERE noi.date_received_all_items IS NOT null