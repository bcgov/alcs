WITH
    appl_components_grouped AS (
        SELECT
            oaac.alr_application_id
        FROM
            oats.oats_alr_appl_components oaac
            JOIN oats.oats_alr_applications oaa ON oaa.alr_application_id = oaac.alr_application_id
        WHERE
            oaa.application_class_code IN ('LOA', 'BLK')
        GROUP BY
            oaac.alr_application_id
        HAVING
            count(oaac.alr_application_id) < 2 -- ignore all applications wit multiple components
    )
SELECT
    aa.file_number,
    aa.type_code,
    aa.local_government_uuid,
    oc.alr_change_code,
    acg.alr_application_id,
    aa.applicant,
    aa.alr_area,
    oc.alr_appl_component_id
FROM
    appl_components_grouped acg
    LEFT JOIN alcs.application aa ON aa.file_number = acg.alr_application_id::TEXT
    JOIN oats.oats_alr_appl_components oc ON acg.alr_application_id = oc.alr_application_id