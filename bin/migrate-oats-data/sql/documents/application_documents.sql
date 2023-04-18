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
		
		join alcs.application_document_code adc 
		on adc.oats_code = od.document_code
		
		join alcs.application a 
		on a.file_number = od.alr_application_id::text
)
select 
	otm.application_uuid ,
	otm.document_uuid ,
	otm.code as type_code ,
	(case when is_public = 'Y' and is_app_lg = 'Y'
		 	then '{P, A, C, G}'::text[]
	     when is_public = 'Y'
			then '{P}'::text[]
	     when is_app_lg='Y'
			then '{A, C, G}'::text[]
		 else '{}'::text[]
	end) as visibility_flags,
	oats_document_id,
	oats_application_id,
    'oats_etl' as audit_created_by
from oats_documents_to_map otm