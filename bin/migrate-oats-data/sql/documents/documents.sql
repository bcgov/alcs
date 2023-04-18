 with oats_documents_to_insert as (
	select
		od.alr_application_id ,
		document_id ,
		document_code ,
		file_name
		
	from oats.oats_documents od 
		left join oats.oats_subject_properties osp 
		on  osp.subject_property_id  = od.subject_property_id 
			and osp.alr_application_id = od.alr_application_id 
	where od.alr_application_id is not null 
       	  and document_code is not null
		  and od.issue_id is null 
		  and od.planning_review_id is null	
)
 SELECT 
      document_id::varchar AS oats_document_id,
      file_name,
      alr_application_id::varchar AS oats_application_id,
      'oats_etl' AS "source",
      'oats_etl' AS audit_created_by,
      '/migrate/' || alr_application_id || '/' || document_id || '_' || file_name AS file_key,
      'pdf' AS mime_type,
	  '{"ORCS Classification: 85100-20"}'::text[] as tags
    FROM 
      oats_documents_to_insert oti
      JOIN alcs.application a ON a.file_number = oti.alr_application_id::varchar
