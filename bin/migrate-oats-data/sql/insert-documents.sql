BEGIN;
DO $$

DECLARE
  chunk_size INTEGER := 1000;
  current_count INTEGER := 0;
  failed_count INTEGER := 0;
BEGIN
  FOR i IN 0..((SELECT COUNT(*) FROM source_table)-1) / chunk_size LOOP
    INSERT INTO destination_table (column1, column2, column3)
    SELECT column1, column2, column3
    FROM source_table
    ORDER BY id
    OFFSET i * chunk_size
    LIMIT chunk_size;

    current_count := current_count + chunk_size;
  END LOOP;

  EXCEPTION WHEN OTHERS THEN
    failed_count := current_count + (SELECT COUNT(*) FROM destination_table)
      - (SELECT COUNT(*) FROM source_table);

    INSERT INTO failed_inserts (column1, column2, column3, reason_for_failure)
    SELECT column1, column2, column3, SQLERRM
    FROM source_table
    ORDER BY id
    OFFSET current_count
    LIMIT failed_count;

  RAISE NOTICE 'Insert completed. % rows inserted successfully, % rows failed.',
    current_count, failed_count;
END;
$$;
COMMIT;


-- populate documents table with documents that have an application from oats that was imported to alcs
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
insert into alcs."document"
(	
	oats_document_id ,
	file_name ,
	oats_application_id ,
	"source" ,
	audit_created_by ,
	file_key ,
	mime_type
)
select 
	document_id::varchar as oats_document_id ,
	file_name ,
	alr_application_id::varchar as oats_application_id ,
    'oats-etl' as "source" ,
    'oats-etl' as audit_created_by ,
    '/migrate/' || alr_application_id || '/' || document_id || '_' || file_name as file_key,
    'pdf' as mime_type

from oats_documents_to_insert oti
join alcs.application a on a.file_number = oti.alr_application_id::varchar


-- map documents from documents table to application_documents table
with oats_documents_to_map as (
	select
		a.uuid as application_uuid,
		d.uuid as document_uuid,
		adc.code,
		publicly_viewable_ind as is_public,
		app_lg_viewable_ind as is_app_lg
	from oats.oats_documents od 

		join alcs."document" d 
		on  d.oats_document_id = od.document_id::varchar  
		
		join alcs.application_document_code adc 
		on adc.oats_code = od.document_code
		
		join alcs.application a 
		on a.file_number = od.alr_application_id::varchar
)
insert into alcs.application_document
(	
	application_uuid ,
	document_uuid ,
	type_code ,
	visibility_flags
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
	end) as visibility_flags

from oats_documents_to_map otm
