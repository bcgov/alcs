SELECT
    count(*)
FROM
    oats.oats_conditions oc
    JOIN alcs.application_decision_component appdc ON appdc.oats_alr_appl_component_id = oc.alr_appl_component_id -- ensure to select only conditions for imported OATS components