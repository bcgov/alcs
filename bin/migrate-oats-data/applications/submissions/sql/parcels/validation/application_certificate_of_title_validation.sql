WITH applications_with_one_or_zero_component_only AS (
    SELECT oaac.alr_application_id,
        max(oaac.alr_appl_component_id) AS alr_appl_component_id -- this IS NOT going TO effect the query since count < 2
    FROM oats.oats_alr_appl_components oaac
        JOIN oats.oats_alr_applications oaa ON oaa.alr_application_id = oaac.alr_application_id
        AND oaa.application_class_code IN ('LOA', 'BLK')
    GROUP BY oaac.alr_application_id
    HAVING count(oaac.alr_application_id) < 2
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
    SELECT oaac.alr_application_id,
        max(oaac.alr_appl_component_id) AS alr_appl_component_id -- this IS NOT going TO effect the query since count < 2
    FROM oats.oats_alr_appl_components oaac
        JOIN oats.oats_alr_applications oaa ON oaa.alr_application_id = oaac.alr_application_id
        AND oaa.application_class_code IN ('LOA', 'BLK')
    GROUP BY oaac.alr_application_id
    HAVING count(oaac.alr_application_id) < 2
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