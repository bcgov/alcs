with
    oats_documents_to_insert as (
        select
            od.planning_review_id,
            document_id,
            document_code,
            file_name
        from
            oats.oats_documents od
        where
            od.alr_application_id is null
            and document_code is not null
            and od.issue_id is null
            and od.planning_review_id is not null
    )
SELECT
    count(*)
FROM
    oats_documents_to_insert oti
    JOIN alcs.planning_review n ON n.file_number = oti.planning_review_id::text