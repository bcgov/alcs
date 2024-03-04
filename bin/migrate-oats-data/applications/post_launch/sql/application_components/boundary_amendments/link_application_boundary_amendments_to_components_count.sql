SELECT
    COUNT(*)
FROM
    alcs.application_boundary_amendment aba
    JOIN alcs.application_decision_component adc ON aba.oats_component_id = adc.oats_alr_appl_component_id;