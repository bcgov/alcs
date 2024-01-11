SELECT
    count(*)
FROM
    oats.oats_soil_change_elements osce
    JOIN alcs.application_decision_component appdc ON appdc.oats_alr_appl_component_id = osce.alr_appl_component_id