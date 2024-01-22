WITH nois_with_one_or_zero_component_only AS (
    SELECT oaa.alr_application_id
    FROM oats.alcs_etl_applications_nois oaa
    WHERE oaa.application_class_code = 'NOI'
        and oaa.alr_change_code <> 'SRW'
),
decision_date_for_nois AS (
    SELECT oaad.alr_appl_decision_id,
        oaa.alr_application_id,
        oaad.decision_date
    FROM oats.oats_alr_appl_decisions oaad
        JOIN oats.oats_alr_applications oaa ON oaad.alr_application_id = oaa.alr_application_id
    WHERE oaa.application_class_code = 'NOI'
        AND oaad.decision_date IS NOT NULL
)
SELECT alr_appl_decision_id,
    alr_application_id,
    decision_date
FROM decision_date_for_nois