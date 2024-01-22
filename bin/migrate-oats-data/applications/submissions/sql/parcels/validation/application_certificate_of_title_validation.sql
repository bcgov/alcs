WITH applications_with_one_or_zero_component_only AS (
    SELECT oaa.alr_application_id,
        oaa.alr_appl_component_id
    FROM oats.alcs_etl_applications_nois oaa
    WHERE oaa.application_class_code IN ('LOA', 'BLK', 'SCH', 'NAN')
        and oaa.alr_change_code <> 'SRW'
),
oats_cert_of_titles AS (
    SELECT od.document_id,
        osp.subject_property_id,
        oaa.alr_application_id
    FROM oats.oats_documents od
        JOIN oats.oats_subject_properties osp ON osp.subject_property_id = od.subject_property_id
        AND osp.alr_application_land_ind = 'Y'
        JOIN applications_with_one_or_zero_component_only oaa ON oaa.alr_application_id = osp.alr_application_id
        JOIN oats.oats_document_codes odc ON odc.document_code = od.document_code
    WHERE od.document_code = 'CT'
),
alcs_oats_certificate_of_titles AS (
    SELECT appp.oats_subject_property_id,
        appd.oats_document_id
    FROM alcs.application_parcel appp
        JOIN alcs.application_document appd ON appd.uuid = appp.certificate_of_title_uuid
)
SELECT *
FROM alcs_oats_certificate_of_titles act
    LEFT JOIN oats_cert_of_titles oct ON oct.subject_property_id = act.oats_subject_property_id
WHERE act.oats_document_id != oct.document_id::TEXT;
-- count certificates of title in oats linked to subject_properties
WITH nois_with_one_or_zero_component_only AS (
    SELECT oaa.alr_application_id,
        oaa.alr_appl_component_id
    FROM oats.alcs_etl_applications_nois oaa
    WHERE oaa.application_class_code IN ('LOA', 'BLK', 'SCH', 'NAN')
        and oaa.alr_change_code <> 'SRW'
)
SELECT count(*)
FROM oats.oats_documents od
    JOIN oats.oats_subject_properties osp ON osp.subject_property_id = od.subject_property_id
    AND osp.alr_application_land_ind = 'Y'
    JOIN nois_with_one_or_zero_component_only oaa ON oaa.alr_application_id = osp.alr_application_id
    JOIN oats.oats_document_codes odc ON odc.document_code = od.document_code
WHERE od.document_code = 'CT';
-- count certificate of titles linked in alcs
SELECT count(*)
FROM alcs.application_parcel appp
    JOIN alcs.application_document appd ON appd.uuid = appp.certificate_of_title_uuid;