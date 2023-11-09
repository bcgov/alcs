SELECT od.document_id,
    od.document_code,
    odc.description,
    osp.subject_property_id,
    oaa.alr_application_id,
    od.who_created,
    noid.uuid AS document_uuid
FROM oats.oats_documents od
    JOIN oats.oats_subject_properties osp ON osp.subject_property_id = od.subject_property_id
    JOIN oats.oats_alr_applications oaa ON oaa.alr_application_id = osp.alr_application_id
    JOIN oats.oats_document_codes odc ON odc.document_code = od.document_code
    JOIN alcs.notice_of_intent_document noid ON noid.oats_document_id::bigint = od.document_id
    JOIN alcs.notice_of_intent_parcel noip ON noip.oats_subject_property_id = osp.subject_property_id
WHERE od.document_code = 'CT'
    AND oaa.application_class_code = 'NOI'