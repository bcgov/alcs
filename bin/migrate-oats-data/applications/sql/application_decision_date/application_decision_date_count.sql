WITH decision_date_for_applications AS (
    SELECT oaad.alr_appl_decision_id,
        oaad.alr_application_id,
        oaad.decision_date
    FROM oats.oats_alr_appl_decisions oaad
        JOIN alcs.application oaa ON oaad.alr_application_id::TEXT = oaa.file_number
    WHERE oaad.decision_date IS NOT NULL
)
SELECT count(*)
FROM decision_date_for_applications