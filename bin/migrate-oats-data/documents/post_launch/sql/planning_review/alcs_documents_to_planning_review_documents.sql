with oats_documents_to_map as (
	select n.uuid as planning_review_uuid,
		d.uuid as document_uuid,
		adc.code,
		publicly_viewable_ind as is_public,
		app_lg_viewable_ind as is_app_lg,
		od.document_id as oats_document_id,
		od.planning_review_id as oats_planning_review_id,
        od."description"
	from oats.oats_documents od
		join alcs."document" d on d.oats_document_id = od.document_id::text
		join alcs.document_code adc on adc.oats_code = od.document_code
		join alcs.planning_review n on n.file_number = od.planning_review_id::text
)
select otm.planning_review_uuid,
	otm.document_uuid,
	otm.code as type_code,
	oats_document_id,
	oats_planning_review_id,
    otm."description"
from oats_documents_to_map otm