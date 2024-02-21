WITH decision_date_for_nois AS (
    SELECT oaad.alr_appl_decision_id,
        oaad.alr_application_id,
        oaad.decision_date
    FROM oats.oats_alr_appl_decisions oaad
        JOIN alcs.notice_of_intent noi ON oaad.alr_application_id::TEXT = noi.file_number
    WHERE oaad.decision_date IS NOT NULL
)
SELECT alr_appl_decision_id,
    alr_application_id,
    decision_date
FROM decision_date_for_nois