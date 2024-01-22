SELECT
    COUNT(*)
FROM
    alcs.application_decision_component adc
    JOIN oats.oats_alr_appl_components oaac on adc.oats_alr_appl_component_id = oaac.alr_appl_component_id
    JOIN oats.oats_subdiv_parcel_intents ospi on oaac.alr_appl_component_id = ospi.alr_appl_component_id