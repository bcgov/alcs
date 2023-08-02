with oats_documents_to_map as (
	select
		a.uuid AS application_uuid,
		d.uuid AS document_uuid,
		adc.code,
		publicly_viewable_ind AS is_public,
		app_lg_viewable_ind AS is_app_lg,
        od.document_id AS oats_document_id,
		od.alr_application_id AS oats_application_id
	FROM oats.oats_documents od 

		JOIN alcs."document_noi" d 
		ON  d.oats_document_id = od.document_id::TEXT  
		
		JOIN alcs.application_document_code adc -- reusing application table mapping
		ON adc.oats_code = od.document_code
		
		JOIN alcs.notice_of_intent a 
		ON a.file_number = od.alr_application_id::TEXT
)
SELECT 
    count(*)
FROM oats_documents_to_map otm