SELECT count(*)
FROM oats.oats_alr_applications oaa
    JOIN alcs.notice_of_intent_submission nois ON nois.file_number = oaa.alr_application_id::TEXT;