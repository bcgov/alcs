WITH ranked_transferees AS (
    SELECT *,
        ROW_NUMBER() OVER (
            PARTITION BY notification_submission_uuid
            ORDER BY type_code DESC,
                audit_created_at
        ) AS rn
    FROM alcs.notification_transferee
)
SELECT count(*)
FROM ranked_transferees
    JOIN alcs.notification_submission ns ON ns."uuid" = notification_submission_uuid
WHERE rn = 1