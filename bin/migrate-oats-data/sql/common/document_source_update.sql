SELECT
    ad."source",
    ad.oats_document_id,
    ad.uploaded_at,
    od.document_id,
    od.document_source_code,
    od.uploaded_date,
    od.when_created
FROM
    alcs."document" ad
    JOIN oats.oats_documents od ON ad.oats_document_id = od.document_id::TEXT 