SELECT
    count(*)
FROM
    oats.oats_alr_appl_decisions oaad
    JOIN oats.oats_alr_appl_components oaac ON oaac.alr_appl_decision_id = oaad.alr_appl_decision_id
    JOIN alcs.application_decision appd ON appd.oats_alr_appl_decision_id = oaad.alr_appl_decision_id -- ONLY GET components OF decisions that imported INTO ALCS