SELECT count(*)  
FROM oats.oats_alr_applications oaa 
JOIN alcs.application a ON a.file_number = oaa.alr_application_id::TEXT 