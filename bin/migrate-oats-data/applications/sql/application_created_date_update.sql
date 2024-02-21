SELECT oaa.created_date, oaa.alr_application_id, a.audit_created_by, oaa.when_created  
FROM oats.oats_alr_applications oaa 
JOIN alcs.application a ON a.file_number = oaa.alr_application_id::TEXT 