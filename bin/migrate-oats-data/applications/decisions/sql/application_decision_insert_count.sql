WITH oats_decision_ids_with_app_id AS (
    SELECT oaad.alr_appl_decision_id,
        CASE
            WHEN oaad.alr_application_id IS NOT NULL THEN oaad.alr_application_id
            ELSE orr.alr_application_id
        END AS application_id
    FROM oats.oats_alr_appl_decisions oaad
        LEFT JOIN oats.oats_reconsideration_requests orr ON orr.reconsideration_request_id = oaad.reconsideration_request_id
)
SELECT count(*)
FROM oats_decision_ids_with_app_id AS decisions
    JOIN alcs.application app ON app.file_number = decisions.application_id::TEXT;