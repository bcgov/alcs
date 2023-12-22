SELECT count(*)
FROM oats.oats_soil_change_elements osce
    JOIN alcs.notice_of_intent_decision_component noidc ON noidc.oats_alr_appl_component_id = osce.alr_appl_component_id