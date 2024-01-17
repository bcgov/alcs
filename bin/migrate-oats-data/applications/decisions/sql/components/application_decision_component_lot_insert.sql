SELECT
    ospi.parcel_area,
    oaac.alr_appl_component_id,
    ospi.subdiv_parcel_intent_id,
    adc."uuid"
FROM
    alcs.application_decision_component adc
    JOIN oats.oats_alr_appl_components oaac ON adc.oats_alr_appl_component_id = oaac.alr_appl_component_id
    JOIN oats.oats_subdiv_parcel_intents ospi ON oaac.alr_appl_component_id = ospi.alr_appl_component_id