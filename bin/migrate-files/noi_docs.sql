DROP TABLE IF EXISTS oats.alcs_etl_noi_docs;

CREATE TABLE
    oats.alcs_etl_noi_docs (
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
    oats.alcs_etl_noi_docs (
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
WITH
    noi AS (
        SELECT
            od.alr_application_id AS app_id,
            od.issue_id AS tissue_id
        FROM
            oats.oats_documents od
        WHERE
            document_code = 'NOI'
    ),
    appl AS (
        SELECT
            *
        FROM
            oats.oats_documents od2
            JOIN noi ON od2.alr_application_id = noi.app_id
    ),
    issue AS (
        SELECT
            *
        FROM
            oats.oats_documents od3
            JOIN noi ON od3.issue_id = noi.tissue_id
    ),
    noi_docs AS (
        SELECT
            *
        FROM
            appl
        UNION
        SELECT
            *
        FROM
            issue
    )
SELECT
    nd.document_id,
    nd.document_code,
    nd.alr_application_id,
    nd.issue_id,
    nd.planning_review_id,
    nd.file_name,
    nd."description",
    nd.document_blob,
    nd.referenced_in_staff_rpt_ind,
    nd.document_source_code,
    nd.subject_property_id,
    nd.publicly_viewable_ind,
    nd.app_lg_viewable_ind,
    nd.uploaded_date,
    nd.who_created,
    nd.when_created,
    nd.who_updated,
    nd.when_updated,
    nd.revision_count
FROM
    noi_docs nd