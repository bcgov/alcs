SELECT
    appdc.oats_alr_appl_component_id,
    osce.soil_change_code,
    osce.material_desc,
    osce.material_origin_desc,
    osce.volume,
    osce.project_area,
    osce."depth",
    osce.project_duration,
    osce.soil_change_element_id
FROM
    oats.oats_soil_change_elements osce
    JOIN alcs.application_decision_component appdc ON appdc.oats_alr_appl_component_id = osce.alr_appl_component_id