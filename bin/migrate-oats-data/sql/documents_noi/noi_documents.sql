WITH
    oats_documents_to_map AS (
        SELECT
            a.uuid AS noi_uuid,
            d.uuid AS document_uuid,
            adc.code,
            publicly_viewable_ind AS is_public,
            app_lg_viewable_ind AS is_app_lg,
            od.document_id AS oats_document_id,
            od.alr_application_id AS oats_application_id
        FROM
            oats.oats_documents od
            JOIN alcs."document_noi" d 
            ON  d.oats_document_id = od.document_id::TEXT  
            JOIN alcs.application_document_code adc -- using adc as it is the same mapping 
            ON adc.oats_code = od.document_code
            JOIN alcs.notice_of_intent a 
            ON a.file_number = od.alr_application_id::TEXT
    )
SELECT
    otm.noi_uuid,
    otm.document_uuid,
    otm.code AS type_code,
    (CASE WHEN is_public = 'Y' and is_app_lg = 'Y'
    	 	THEN '{P, A, C, G}'::TEXT[]
         WHEN is_public = 'Y'
    		THEN '{P}'::TEXT[]
         WHEN is_app_lg='Y'
    		THEN '{A, C, G}'::TEXT[]
    	 ELSE '{}'::TEXT[]
    END) AS visibility_flags,
    oats_document_id,
    oats_application_id,
    'oats_etl' AS audit_created_by
FROM
    oats_documents_to_map otm