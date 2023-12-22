SELECT oc.condition_id,
    admin_fee,
    approval_dependant_ind,
    completion_date,
    noidc.notice_of_intent_decision_uuid AS decision_uuid,
    "description",
    condition_code
FROM oats.oats_conditions oc
    JOIN alcs.notice_of_intent_decision_component noidc ON noidc.oats_alr_appl_component_id = oc.alr_appl_component_id -- ensure to select only conditions for imported OATS components
