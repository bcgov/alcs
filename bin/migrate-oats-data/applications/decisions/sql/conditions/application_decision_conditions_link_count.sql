SELECT
    count(*)
FROM
    alcs.application_decision_condition appdc
    JOIN oats.oats_conditions oc ON oc.condition_id = appdc.oats_condition_id
    JOIN alcs.application_decision_component appdc2 ON appdc2.oats_alr_appl_component_id = oc.alr_appl_component_id