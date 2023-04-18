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
    'oats_etl' as "source" ,
    'oats_etl' as audit_created_by ,
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

-------------------------------------


WITH oats_documents_to_insert AS (
    SELECT
        od.alr_application_id,
        document_id,
        document_code,
        file_name
    FROM oats.oats_documents od
    LEFT JOIN oats.oats_subject_properties osp 
        ON osp.subject_property_id = od.subject_property_id 
        AND osp.alr_application_id = od.alr_application_id 
    WHERE od.alr_application_id IS NOT NULL 
        AND document_code IS NOT NULL
        AND od.issue_id IS NULL 
        AND od.planning_review_id IS NULL
),
document_chunks AS (
    SELECT 
        document_id::VARCHAR AS oats_document_id,
        file_name, 
        alr_application_id::VARCHAR AS oats_application_id,
        'oats_etl' AS "source",
        'oats_etl' AS audit_created_by,
        '/migrate/' || alr_application_id || '/' || document_id || '_' || file_name AS file_key,
        'pdf' AS mime_type,
        ROW_NUMBER() OVER (ORDER BY document_id) AS row_num
    FROM oats_documents_to_insert oti
    JOIN alcs.application a ON a.file_number = oti.alr_application_id::VARCHAR
),
failed_document_import AS (
    SELECT *
    FROM document_chunks
    WHERE 1=0
)
SELECT NULL; --initialize variable to ensure that the first loop runs


WHILE (SELECT COUNT(*) FROM document_chunks WHERE row_num > (SELECT COALESCE(MAX(row_num), 0) FROM failed_document_import)) > 0
LOOP
    BEGIN
        INSERT INTO alcs."document"
        (
            oats_document_id,
            file_name,
            oats_application_id,
            "source",
            audit_created_by,
            file_key,
            mime_type
        )
        SELECT *
        FROM document_chunks
        WHERE row_num > (SELECT COALESCE(MAX(row_num), 0) FROM failed_document_import)
        ORDER BY row_num
        LIMIT 10000;
    EXCEPTION WHEN OTHERS THEN
        INSERT INTO failed_document_import
        SELECT *
        FROM document_chunks
        WHERE row_num > (SELECT COALESCE(MAX(row_num), 0) FROM failed_document_import);
    END;
END LOOP;


-- Constants for chunking
DO $$
DECLARE
  -- Cursor declaration for chunked data
  CHUNK_SIZE CONSTANT INTEGER := 10000;
  MAX_RETRIES CONSTANT INTEGER := 5;
  
  -- Cursor declaration for chunked data
  doc_cursor CURSOR FOR 
    SELECT
      od.alr_application_id,
      document_id,
      file_name
    FROM oats.oats_documents od
    LEFT JOIN oats.oats_subject_properties osp
      ON osp.subject_property_id = od.subject_property_id 
      AND osp.alr_application_id = od.alr_application_id 
    WHERE od.alr_application_id IS NOT NULL 
      AND document_code IS NOT NULL
      AND od.issue_id IS NULL 
      AND od.planning_review_id IS null;
      
  -- Variables to hold chunk data
  chunk_doc_id INTEGER;
  chunk_file_name VARCHAR(100);
  chunk_application_id INTEGER;
  
BEGIN  
  -- Open the cursor
  OPEN doc_cursor;

  -- Loop over chunks of data
  LOOP
    FETCH doc_cursor INTO chunk_application_id, chunk_doc_id, chunk_file_name;
    EXIT WHEN NOT FOUND;

    -- Query to insert a chunk of documents
    INSERT INTO alcs."document" (
      oats_document_id,
      file_name,
      oats_application_id,
      "source",
      audit_created_by,
      file_key,
      mime_type
    )
    SELECT 
      chunk_doc_id,
      chunk_file_name,
      chunk_application_id,
      'oats_etl' as "source",
      'oats_etl' as audit_created_by,
      '/migrate/' || chunk_application_id || '/' || chunk_doc_id || '_' || chunk_file_name as file_key,
      'pdf' as mime_type
    FROM doc_cursor
    WHERE CURRENT OF doc_cursor
    LIMIT CHUNK_SIZE;

    -- Insert any failed documents into the failed_imports table
    INSERT INTO failed_imports (
      oats_document_id,
      file_name,
      oats_application_id,
      "source",
      audit_created_by,
      file_key,
      mime_type,
      retry_count
    )
    SELECT 
      chunk_doc_id,
      chunk_file_name,
      chunk_application_id,
      'oats_etl' as "source",
      'oats_etl' as audit_created_by,
      '/migrate/' || chunk_application_id || '/' || chunk_doc_id || '_' || chunk_file_name as file_key,
      'pdf' as mime_type,
      0
    WHERE NOT EXISTS (SELECT * FROM alcs."document" WHERE oats_document_id = chunk_doc_id);

  END LOOP;

  -- Close the cursor
  CLOSE doc_cursor;

  -- Retry logic for failed inserts
  WHILE (SELECT COUNT(*) FROM failed_imports WHERE retry_count < MAX_RETRIES) > 0 LOOP
    UPDATE failed_imports 
    SET retry_count = retry_count + 1 
    WHERE retry_count < MAX_RETRIES;
    
    IF (SELECT COUNT(*) FROM failed_imports WHERE retry_count >= MAX_RETRIES) > 0 THEN
      RAISE NOTICE 'Maximum number of retries reached';
      EXIT;
    END IF;
    
    PERFORM pg_sleep(5);
  END LOOP;

END; $$;