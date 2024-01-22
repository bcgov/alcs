SELECT noidc.oats_alr_appl_component_id,
    osce.soil_change_code,
    osce.material_desc,
    osce.material_origin_desc,
    osce.volume,
    osce.project_area,
    osce."depth",
    osce.project_duration,
    osce.soil_change_element_id
FROM oats.oats_soil_change_elements osce
    JOIN alcs.notice_of_intent_decision_component noidc ON noidc.oats_alr_appl_component_id = osce.alr_appl_component_id