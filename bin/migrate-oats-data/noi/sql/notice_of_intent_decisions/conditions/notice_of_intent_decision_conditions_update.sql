SELECT noidc."uuid" AS condition_uuid,
    oaad.security_amt,
    oc.condition_id
FROM oats.oats_conditions oc
    JOIN alcs.notice_of_intent_decision_condition noidc ON noidc.oats_condition_id = oc.condition_id -- only retrieve conditions that were imported into ALCS
    JOIN oats.oats_alr_appl_components oaac ON oaac.alr_appl_component_id = oc.alr_appl_component_id
    JOIN oats.oats_alr_appl_decisions oaad ON oaad.alr_appl_decision_id = oaac.alr_appl_decision_id