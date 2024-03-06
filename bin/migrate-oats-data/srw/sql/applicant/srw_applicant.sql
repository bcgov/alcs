WITH ranked_transferees AS (
    SELECT *,
        ROW_NUMBER() OVER (
            PARTITION BY notification_submission_uuid
            ORDER BY type_code DESC,
                audit_created_at
        ) AS rn
    FROM alcs.notification_transferee
)
SELECT *,
    (
        CASE
            WHEN (
                SELECT count(*)
                FROM alcs.notification_transferee
                WHERE notification_submission_uuid = ranked_transferees.notification_submission_uuid
            ) > 1 THEN ' et al.'
            ELSE ''
        END
    ) AS applicant_suffix,
    ns.file_number
FROM ranked_transferees
    JOIN alcs.notification_submission ns ON ns."uuid" = notification_submission_uuid
WHERE rn = 1