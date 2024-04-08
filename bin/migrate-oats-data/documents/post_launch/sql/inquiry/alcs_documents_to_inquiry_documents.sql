with oats_documents_to_map as (
	select n.uuid as inquiry_uuid,
		d.uuid as document_uuid,
		adc.code,
		publicly_viewable_ind as is_public,
		app_lg_viewable_ind as is_app_lg,
		od.document_id as oats_document_id,
		od.issue_id as oats_issue_id,
        od."description"
	from oats.oats_documents od
		join alcs."document" d on d.oats_document_id = od.document_id::text
		join alcs.document_code adc on adc.oats_code = od.document_code
		join alcs.inquiry n on n.file_number = od.issue_id::text
)
select otm.inquiry_uuid,
	otm.document_uuid,
	otm.code as type_code,
	(
		case
			when is_public = 'Y'
			and is_app_lg = 'Y' then '{P, A, C, G}'::text []
			when is_public = 'Y' then '{P}'::text []
			when is_app_lg = 'Y' then '{A, C, G}'::text []
			else '{}'::text []
		end
	) as visibility_flags,
	oats_document_id,
	oats_issue_id,
    otm."description"
from oats_documents_to_map otm