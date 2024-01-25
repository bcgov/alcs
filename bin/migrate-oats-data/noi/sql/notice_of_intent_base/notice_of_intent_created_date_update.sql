SELECT oaa.created_date, oaa.alr_application_id, oaa.when_created
FROM oats.oats_alr_applications oaa 
JOIN alcs.notice_of_intent noi ON noi.file_number = oaa.alr_application_id::TEXT 