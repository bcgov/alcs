SELECT count(*)
FROM oats.oats_documents od
    JOIN oats.oats_subject_properties osp ON osp.subject_property_id = od.subject_property_id
    JOIN oats.oats_alr_applications oaa ON oaa.alr_application_id = osp.alr_application_id
    JOIN oats.oats_document_codes odc ON odc.document_code = od.document_code
    JOIN alcs.application_document appd ON appd.oats_document_id::bigint = od.document_id
    JOIN alcs.application_parcel appp ON appp.oats_subject_property_id = osp.subject_property_id
WHERE od.document_code = 'CT'
    AND oaa.application_class_code IN ('LOA', 'BLK');