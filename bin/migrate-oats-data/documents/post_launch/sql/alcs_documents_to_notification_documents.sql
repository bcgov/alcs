with oats_documents_to_map as (
	select n.uuid as notification_uuid,
		d.uuid as document_uuid,
		adc.code,
		publicly_viewable_ind as is_public,
		app_lg_viewable_ind as is_app_lg,
		od.document_id as oats_document_id,
		od.alr_application_id as oats_application_id,
        oaa.plan_no,
        oaa.control_no,
        od."description"
	from oats.oats_documents od
		join alcs."document" d on d.oats_document_id = od.document_id::text
		join alcs.document_code adc on adc.oats_code = od.document_code
		join alcs.notification n on n.file_number = od.alr_application_id::text
        JOIN oats.oats_alr_applications oaa ON od.alr_application_id = oaa.alr_application_id
)
select otm.notification_uuid,
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
	oats_application_id,
	plan_no,
    control_no,
    otm."description"
from oats_documents_to_map otm