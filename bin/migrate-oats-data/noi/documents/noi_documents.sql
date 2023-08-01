WITH
    oats_documents_to_map AS (
        SELECT
            a.uuid AS application_uuid,
            d.uuid AS document_uuid,
            adc.code,
            publicly_viewable_ind AS is_public,
            app_lg_viewable_ind AS is_app_lg,
            od.document_id AS oats_document_id,
            od.alr_application_id AS oats_application_id
        from
            oats.oats_documents od
            JOIN alcs."document" d 
            ON  d.oats_document_id = od.document_id::TEXT  
            JOIN alcs.application_document_code adc 
            ON adc.oats_code = od.document_code
            JOIN alcs.application a 
            ON a.file_number = od.alr_application_id::TEXT
    )
SELECT
    otm.application_uuid,
    otm.document_uuid,
    otm.code AS type_code,
    (case when is_public = 'Y' and is_app_lg = 'Y'
    	 	then '{P, A, C, G}'::TEXT[]
         when is_public = 'Y'
    		then '{P}'::TEXT[]
         when is_app_lg='Y'
    		then '{A, C, G}'::TEXT[]
    	 else '{}'::TEXT[]
    end) AS visibility_flags,
    oats_document_id,
    oats_application_id,
    'oats_etl' AS audit_created_by
from
    oats_documents_to_map otm