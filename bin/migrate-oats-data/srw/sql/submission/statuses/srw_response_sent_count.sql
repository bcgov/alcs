WITH components_grouped AS (
    SELECT aes.alr_application_id
    FROM oats.alcs_etl_srw aes
    WHERE aes.application_class_code IN ('LOA', 'BLK', 'SCH', 'NAN')
        and aes.alr_change_code = 'SRW'
)
SELECT count (*)
FROM oats.oats_alr_applications oaa2
    JOIN components_grouped cg ON cg.alr_application_id = oaa2.alr_application_id
    JOIN alcs.notification_submission nots ON nots.file_number = oaa2.alr_application_id::TEXT
    LEFT JOIN oats.oats_email_notifications oen ON oaa2.alr_application_id = oen.alr_application_id; 