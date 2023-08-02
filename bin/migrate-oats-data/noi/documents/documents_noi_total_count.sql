WITH
    oats_documents_to_insert AS (
        SELECT
            od.alr_application_id,
            document_id,
            document_code,
            file_name
        FROM
            oats.oats_documents od
            LEFT JOIN oats.oats_subject_properties osp ON osp.subject_property_id = od.subject_property_id
            AND osp.alr_application_id = od.alr_application_id
        WHERE
            od.alr_application_id IS NOT NULL
            AND document_code IS NOT NULL
            AND od.issue_id IS NULL
            AND od.planning_review_id IS NULL
    )
SELECT
    count(*)
FROM
    oats_documents_to_insert oti
    JOIN alcs.notice_of_intent a ON a.file_number = oti.alr_application_id::TEXT