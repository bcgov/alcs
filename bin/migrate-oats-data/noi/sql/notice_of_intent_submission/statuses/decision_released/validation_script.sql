--- tun it manually in IDE of your choice
--- compare to numbers returned by script. The should match
-- total count of set 'ALCD' - Decision Released
SELECT count(*)
FROM alcs.notice_of_intent_submission_to_submission_status noistss
WHERE noistss.effective_date IS NOT NULL
    AND status_type_code = 'ALCD';
-- total count of expected 'ALCD' - Decision Released
SELECT count(*)
FROM alcs.notice_of_intent noi
    JOIN alcs.notice_of_intent_submission nois ON noi.file_number = nois.file_number
WHERE noi.decision_date IS NOT null