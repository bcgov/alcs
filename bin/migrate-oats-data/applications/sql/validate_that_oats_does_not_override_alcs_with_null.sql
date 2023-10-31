-- This query checks that OATS NULL does not override fee_paid_date if it has value in ALCS.
-- Run this query before ETL and after to ensure that the result is the same
WITH appl_with_one_component AS (
    SELECT oaac.alr_application_id
    FROM oats.oats_alr_appl_components oaac
        JOIN oats.oats_alr_applications oaa ON oaa.alr_application_id = oaac.alr_application_id
    WHERE oaa.application_class_code IN ('LOA', 'BLK')
    GROUP BY oaac.alr_application_id
    HAVING count(oaac.alr_application_id) < 2 -- ignore all applications wit multiple components
)
SELECT
oats_appl.alr_application_id,
    appl.fee_paid_date AT TIME ZONE 'UTC',
    oaa.fee_received_date,
    appl.date_submitted_to_alc ,
    oaa.submitted_to_alc_date 
FROM alcs.application appl
    JOIN appl_with_one_component oats_appl ON oats_appl.alr_application_id::TEXT = appl.file_number
    JOIN oats.oats_alr_applications oaa ON oaa.alr_application_id = oats_appl.alr_application_id
WHERE 
(oaa.fee_received_date IS NULL AND appl.fee_paid_date IS NOT NULL)
OR (oaa.submitted_to_alc_date IS NULL AND appl.date_submitted_to_alc IS NOT NULL)