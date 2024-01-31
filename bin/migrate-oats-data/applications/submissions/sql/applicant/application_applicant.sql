WITH ranked_parcels AS (
    SELECT *,
        ROW_NUMBER() OVER (
            PARTITION BY application_submission_uuid
            ORDER BY audit_created_at
        ) AS rn
    FROM alcs.application_parcel
),
first_parcel_per_submission AS (
    SELECT uuid,
        audit_created_at,
        application_submission_uuid
    FROM ranked_parcels
    WHERE rn = 1
),
ranked_owners AS (
    SELECT *,
        ROW_NUMBER() OVER (
            PARTITION BY app_own.application_parcel_uuid
            ORDER BY appo.audit_created_at
        ) AS rn,
        fp.application_submission_uuid as submission_uuid
    FROM alcs.application_owner appo
        JOIN alcs.application_parcel_owners_application_owner app_own ON app_own.application_owner_uuid = appo.uuid
        JOIN first_parcel_per_submission AS fp ON fp.uuid = app_own.application_parcel_uuid
        JOIN alcs.application_submission nois ON nois.uuid = fp.application_submission_uuid
)
SELECT last_name,
    organization_name,
    (
        CASE
            WHEN (
                SELECT count(*)
                FROM alcs.application_parcel_owners_application_owner
                WHERE application_parcel_uuid = ranked_owners.application_parcel_uuid
            ) > 1 THEN 'et al.'
            ELSE ''
        END
    ) as owner_count_extension,
    submission_uuid
FROM ranked_owners
WHERE rn = 1
    AND applicant ILIKE 'unknown'