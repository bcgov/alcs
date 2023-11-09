WITH oats_cert_of_titles AS (
    SELECT od.document_id,
        osp.subject_property_id,
        oaa.alr_application_id
    FROM oats.oats_documents od
        JOIN oats.oats_subject_properties osp ON osp.subject_property_id = od.subject_property_id
        JOIN oats.oats_alr_applications oaa ON oaa.alr_application_id = osp.alr_application_id
        JOIN oats.oats_document_codes odc ON odc.document_code = od.document_code
    WHERE od.document_code = 'CT'
        AND oaa.application_class_code = 'NOI'
),
alcs_oats_certificate_of_titles AS (
    SELECT noip.oats_subject_property_id,
        noid.oats_document_id
    FROM alcs.notice_of_intent_parcel noip
        JOIN alcs.notice_of_intent_document noid ON noid.uuid = noip.certificate_of_title_uuid
)
SELECT *
FROM alcs_oats_certificate_of_titles act
    LEFT JOIN oats_cert_of_titles oct ON oct.subject_property_id = act.oats_subject_property_id
WHERE act.oats_document_id != oct.document_id::TEXT;
-- count certificates of title in oats linked to subject_properties
SELECT count(*)
FROM oats.oats_documents od
    JOIN oats.oats_subject_properties osp ON osp.subject_property_id = od.subject_property_id
    JOIN oats.oats_alr_applications oaa ON oaa.alr_application_id = osp.alr_application_id
    JOIN oats.oats_document_codes odc ON odc.document_code = od.document_code
WHERE od.document_code = 'CT'
    AND oaa.application_class_code = 'NOI';
-- count certificate of titles linked in alcs
SELECT count(*)
FROM alcs.notice_of_intent_parcel noip
    JOIN alcs.notice_of_intent_document noid ON noid.uuid = noip.certificate_of_title_uuid;