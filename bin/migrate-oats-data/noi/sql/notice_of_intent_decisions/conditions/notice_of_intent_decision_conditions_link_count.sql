SELECT count(*)
FROM alcs.notice_of_intent_decision_condition noidc
    JOIN oats.oats_conditions oc ON oc.condition_id = noidc.oats_condition_id
    JOIN alcs.notice_of_intent_decision_component noidc2 ON noidc2.oats_alr_appl_component_id = oc.alr_appl_component_id