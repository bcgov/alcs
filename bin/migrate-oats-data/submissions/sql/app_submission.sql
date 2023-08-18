-- WITH
--     alcs_apps AS (
--         SELECT
--             aa.file_number,
--             aa.local_government_uuid,
--             aa.type_code
--         FROM
--             alcs.application aa
--         WHERE
--             audit_created_by = 'oats_etl'
--     ),
--     oats_components AS (
--         SELECT
--             oac.alr_application_id,
--             oac.alr_appl_component_id,
--             oac.alr_change_code
--         FROM
--             oats.oats_alr_appl_components oac
--     )
-- SELECT
--     aps.file_number,
--     aps.type_code,
--     aps.local_government_uuid,
--     oc.alr_change_code,
--     oc.alr_application_id AS app_id
--     -- ospi.subdiv_parcel_intent_id
-- FROM
--     alcs_apps aps
--     JOIN oats_components oc ON aps.file_number = oc.alr_application_id::TEXT
--     --JOIN oats.oats_subdiv_parcel_intents ospi ON oc.alr_appl_component_id = ospi.alr_appl_component_id
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
    acg.alr_application_id
FROM
    appl_components_grouped acg
    LEFT JOIN alcs.application aa ON aa.file_number = acg.alr_application_id::TEXT
    JOIN oats.oats_alr_appl_components oc ON acg.alr_application_id = oc.alr_application_id