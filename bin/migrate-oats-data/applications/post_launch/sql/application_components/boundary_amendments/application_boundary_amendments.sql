SELECT
    a.file_number,
    adc.alr_area,
    adc.application_decision_component_type_code,
    oaac.amendment_year,
    oaac.amendment_period,
    oaac.alr_appl_component_id
FROM
    oats.oats_alr_appl_components oaac
    JOIN alcs.application_decision_component adc ON oaac.alr_appl_component_id = adc.oats_alr_appl_component_id
    JOIN alcs.application_decision ad ON adc.application_decision_uuid = ad."uuid"
    JOIN alcs.application a ON ad.application_uuid = a."uuid"
WHERE
    oaac.amendment_year IS NOT NULL