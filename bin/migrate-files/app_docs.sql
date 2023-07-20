DROP TABLE IF EXISTS oats.alcs_etl_app_docs;

CREATE TABLE
	oats.alcs_etl_app_docs (
		document_id INT,
		document_code VARCHAR,
		alr_application_id INT,
		issue_id INT,
		planning_review_id INT,
		file_name VARCHAR,
		"description" VARCHAR,
		document_blob BYTEA,
		referenced_in_staff_rpt_ind VARCHAR,
		document_source_code VARCHAR,
		subject_property_id INT,
		publicly_viewable_ind VARCHAR,
		app_lg_viewable_ind VARCHAR,
		uploaded_date TIMESTAMP,
		who_created VARCHAR,
		when_created TIMESTAMP,
		who_updated VARCHAR,
		when_updated TIMESTAMP,
		revision_count INT
	);

INSERT INTO
	oats.alcs_etl_app_docs (
		document_id,
		document_code,
		alr_application_id,
		issue_id,
		planning_review_id,
		file_name,
		"description",
		document_blob,
		referenced_in_staff_rpt_ind,
		document_source_code,
		subject_property_id,
		publicly_viewable_ind,
		app_lg_viewable_ind,
		uploaded_date,
		who_created,
		when_created,
		who_updated,
		when_updated,
		revision_count
	)
select
	ad.document_id,
	ad.document_code,
	ad.alr_application_id,
	ad.issue_id,
	ad.planning_review_id,
	ad.file_name,
	ad."description",
	ad.document_blob,
	ad.referenced_in_staff_rpt_ind,
	ad.document_source_code,
	ad.subject_property_id,
	ad.publicly_viewable_ind,
	ad.app_lg_viewable_ind,
	ad.uploaded_date,
	ad.who_created,
	ad.when_created,
	ad.who_updated,
	ad.when_updated,
	ad.revision_count
from
	oats.alcs_etl_noi_docs nd
	right join oats.oats_documents ad on nd.document_id = ad.document_id
where
	nd.document_id is null