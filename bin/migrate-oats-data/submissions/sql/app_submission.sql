WITH
    alcs_apps AS (
        SELECT
            aa.file_number,
            aa.local_government_uuid,
            aa.type_code
        FROM
            alcs.application aa
        WHERE
            audit_created_by = 'oats_etl'
    ),
    oats_components AS (
        SELECT
            oac.alr_application_id,
            oac.alr_appl_component_id,
            oac.alr_change_code
        FROM
            oats.oats_alr_appl_components oac
    )
SELECT
    aps.file_number,
    aps.type_code,
    aps.local_government_uuid,
    oc.alr_change_code,
    oc.alr_application_id
    -- ospi.subdiv_parcel_intent_id
FROM
    alcs_apps aps
    JOIN oats_components oc ON aps.file_number = oc.alr_application_id::TEXT
    JOIN oats.oats_subdiv_parcel_intents ospi ON oc.alr_appl_component_id = ospi.alr_appl_component_id