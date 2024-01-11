SELECT
    appd."uuid" AS decision_uuid,
    oaac.alr_appl_component_id AS component_id,
    oaac.agri_capability_code,
    oaac.agri_cap_consultant,
    oaac.agri_cap_map,
    oaac.capability_source_code,
    oaac.component_area,
    oaac.rsdntl_use_end_date,
    oaac.nonfarm_use_end_date,
    oaac.decision_expiry_date,
    oaac.alr_change_code,
    oaac.nonfarm_use_type_code,
    oaac.nonfarm_use_subtype_code,
    oaac.rsdntl_use_type_code,
    oaac.legislation_code
FROM
    oats.oats_alr_appl_decisions oaad
    JOIN oats.oats_alr_appl_components oaac ON oaac.alr_appl_decision_id = oaad.alr_appl_decision_id
    JOIN alcs.application_decision appd ON appd.oats_alr_appl_decision_id = oaad.alr_appl_decision_id -- ONLY GET components OF decisions that imported INTO ALCS