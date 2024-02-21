WITH nois_with_one_or_zero_component_only AS (
    SELECT oaa.alr_application_id
    FROM oats.alcs_etl_applications_nois oaa
    WHERE oaa.application_class_code IN ('LOA', 'BLK', 'SCH', 'NAN')
        and oaa.alr_change_code <> 'SRW'
),
oats_decision_date_for_applications AS (
    SELECT oaad.alr_appl_decision_id,
        oaa.alr_application_id,
        oaad.decision_date
    FROM oats.oats_alr_appl_decisions oaad
        JOIN applications_with_one_or_zero_component_only oaa ON oaad.alr_application_id = oaa.alr_application_id
    WHERE oaad.decision_date IS NOT NULL
)
SELECT oats_decision_date.alr_appl_decision_id,
    oats_decision_date.alr_application_id,
    oats_decision_date.decision_date,
    appl.decision_date
FROM oats_decision_date_for_applications AS oats_decision_date
    JOIN alcs.application appl ON oats_decision_date.alr_application_id::text = appl.file_number
WHERE oats_decision_date.decision_date != appl.decision_date AT TIME ZONE 'UTC'