WITH oats_decision_ids_with_app_id AS (
    SELECT oaad.alr_appl_decision_id,
        CASE
            WHEN oaad.alr_application_id IS NOT NULL THEN oaad.alr_application_id
            ELSE orr.alr_application_id
        END AS application_id
    FROM oats.oats_alr_appl_decisions oaad
        LEFT JOIN oats.oats_reconsideration_requests orr ON orr.reconsideration_request_id = oaad.reconsideration_request_id
),
oats_conditions AS (
    SELECT oaac.alr_appl_decision_id
    FROM oats.oats_conditions oc
        JOIN oats.oats_alr_appl_components oaac ON oc.alr_appl_component_id = oaac.alr_appl_component_id
        AND oaac.alr_appl_decision_id IS NOT null
    GROUP BY oaac.alr_appl_decision_id
)
SELECT decisions.alr_appl_decision_id,
    decisions.application_id,
    noi."uuid" AS noi_uuid,
    oaad2.when_created,
    oaad2.decision_date,
    oaad2.decision_desc,
    oaad2.outright_refusal_ind,
    oaad2.rescinded_comments,
    oaad2.rescinded_date,
    oaad2.resolution_number,
    CASE
        WHEN oats_conditions.alr_appl_decision_id IS NOT NULL THEN TRUE
        ELSE FALSE
    END AS is_subject_to_conditions
FROM oats_decision_ids_with_app_id AS decisions
    JOIN alcs.notice_of_intent noi ON noi.file_number = decisions.application_id::TEXT
    JOIN oats.oats_alr_appl_decisions oaad2 ON oaad2.alr_appl_decision_id = decisions.alr_appl_decision_id
    LEFT JOIN oats_conditions ON oats_conditions.alr_appl_decision_id = oaad2.alr_appl_decision_id