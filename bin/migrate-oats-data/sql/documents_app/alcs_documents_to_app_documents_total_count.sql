with oats_documents_to_map as (
	select
		a.uuid as application_uuid,
		d.uuid as document_uuid,
		adc.code,
		publicly_viewable_ind as is_public,
		app_lg_viewable_ind as is_app_lg,
        od.document_id as oats_document_id,
		od.alr_application_id as oats_application_id
	from oats.oats_documents od 

		join alcs."document" d 
		on  d.oats_document_id = od.document_id::text  
		
		join alcs.document_code adc 
		on adc.oats_code = od.document_code
		
		join alcs.application a 
		on a.file_number = od.alr_application_id::text
)
select 
    count(*)
from oats_documents_to_map otm