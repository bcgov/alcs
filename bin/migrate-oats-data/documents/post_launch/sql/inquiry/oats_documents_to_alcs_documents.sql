with oats_documents_to_insert as (
	select od.issue_id,
		document_id,
		document_code,
		file_name,
		od.who_created,
        od.document_source_code,
        od.uploaded_date,
        od.when_created
	from oats.oats_documents od
	where od.alr_application_id is null
		and document_code is not null
		and od.issue_id is not null
		and od.planning_review_id is null
)
SELECT document_id::text AS oats_document_id,
	file_name,
	issue_id::text AS oats_issue_id,
	'migrate/issue/' || issue_id || '/' || document_id || '_' || file_name AS file_key,
	'pdf' AS mime_type,
	'{"ORCS Classification: 85000"}'::text [] as tags,
    who_created,
    document_source_code,
    uploaded_date,
    when_created,
    document_id
FROM oats_documents_to_insert oti
	JOIN alcs.inquiry n ON n.file_number = oti.issue_id::text