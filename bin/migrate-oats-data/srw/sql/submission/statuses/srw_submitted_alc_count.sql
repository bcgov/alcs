WITH components_grouped AS (
    SELECT aes.alr_application_id
    FROM oats.alcs_etl_srw aes
    WHERE aes.application_class_code IN ('LOA', 'BLK', 'SCH', 'NAN')
        and aes.alr_change_code = 'SRW'
)
SELECT count(*)
FROM components_grouped
    JOIN alcs.notification_submission nots ON nots.file_number = alr_application_id::TEXT;