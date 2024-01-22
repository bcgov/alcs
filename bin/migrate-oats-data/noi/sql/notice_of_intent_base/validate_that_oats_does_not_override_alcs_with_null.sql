-- this query checks that OATS NULL does not override fee_paid_date if it has value in ALCS
-- Run this query before ETL and after to ensure that the result is the same
WITH noi_with_one_component AS (
    SELECT oaa.alr_application_id
    FROM oats.alcs_etl_applications_nois oaa
    WHERE oaa.application_class_code = 'NOI'
        and oaa.alr_change_code <> 'SRW'
)
SELECT noi.fee_paid_date AT TIME ZONE 'UTC',
    oaa.fee_received_date,
    oats_noi.alr_application_id
FROM alcs.notice_of_intent noi
    JOIN noi_with_one_component oats_noi ON oats_noi.alr_application_id::TEXT = noi.file_number
    JOIN oats.oats_alr_applications oaa ON oaa.alr_application_id = oats_noi.alr_application_id
WHERE oaa.fee_received_date IS NULL
    AND noi.fee_paid_date IS NOT NULL;