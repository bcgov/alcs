 WITH oats_documents_to_insert AS (
	SELECT
		od.alr_application_id ,
		document_id ,
		document_code ,
		file_name , od.who_created
		
	from oats.oats_documents od 
		LEFT JOIN oats.oats_subject_properties osp 
		ON  osp.subject_property_id  = od.subject_property_id 
			AND osp.alr_application_id = od.alr_application_id 
	WHERE od.alr_application_id IS NOT NULL 
       	  AND document_code IS NOT NULL
		  AND od.issue_id IS NULL 
		  AND od.planning_review_id IS NULL	
)
 SELECT 
      document_id::TEXT AS oats_document_id,
      file_name,
      alr_application_id::TEXT AS oats_application_id,
      'oats_etl' AS "source",
      'oats_etl' AS audit_created_by,
      '/migrate/application/' || alr_application_id || '/' || document_id || '_' || file_name AS file_key,
      'pdf' AS mime_type,
	  '{"ORCS Classification: 85100-20"}'::TEXT[] AS tags,
	  CASE
		 WHEN who_created = 'PROXY_OATS_LOCGOV' THEN 'OATS_P'
		 WHEN who_created = 'PROXY_OATS_APPLICANT' THEN 'OATS_P'
		 ELSE 'OATS'
		END AS "system"
    FROM 
      oats_documents_to_insert oti
	  JOIN alcs.notice_of_intent noi ON noi.file_number = oti.alr_application_id::TEXT 