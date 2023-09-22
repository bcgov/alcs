WITH nois_with_one_or_zero_component_only AS (
    SELECT oaac.alr_application_id
    FROM oats.oats_alr_appl_components oaac
    GROUP BY oaac.alr_application_id
    HAVING count(oaac.alr_application_id) < 2
),
oats_decision_date_for_nois AS (
    SELECT oaad.alr_appl_decision_id,
        oaa.alr_application_id,
        oaad.decision_date
    FROM oats.oats_alr_appl_decisions oaad
        JOIN oats.oats_alr_applications oaa ON oaad.alr_application_id = oaa.alr_application_id
    WHERE oaa.application_class_code = 'NOI'
        AND oaad.decision_date IS NOT NULL
)
select oats_decision_date.alr_appl_decision_id,
    oats_decision_date.alr_application_id,
    oats_decision_date.decision_date,
    noi.decision_date
from oats_decision_date_for_nois AS oats_decision_date
    JOIN alcs.notice_of_intent noi ON oats_decision_date.alr_application_id::text = noi.file_number
WHERE oats_decision_date.decision_date != noi.decision_date AT TIME ZONE 'UTC'