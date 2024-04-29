WITH
	oats_documents_to_insert as (
		select
			od.issue_id,
			document_id,
			document_code,
			file_name
		from
			oats.oats_documents od
		where
			od.alr_application_id is null
			and document_code is not null
			and od.issue_id is not null
			and od.planning_review_id is null
	)
SELECT
	count(*)
FROM
	oats_documents_to_insert oti
	JOIN alcs.inquiry n ON n.file_number = oti.issue_id::text