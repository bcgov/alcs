SELECT
    COUNT(*)
FROM
    alcs.document ad
    JOIN oats.oats_documents od ON ad.oats_document_id = od.document_id::TEXT;