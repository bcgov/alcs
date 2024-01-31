WITH ranked_parcels AS (
    SELECT *,
        ROW_NUMBER() OVER (
            PARTITION BY notice_of_intent_submission_uuid
            ORDER BY audit_created_at
        ) AS rn
    FROM alcs.notice_of_intent_parcel
),
first_parcel_per_submission AS (
    SELECT uuid,
        audit_created_at,
        notice_of_intent_submission_uuid
    FROM ranked_parcels
    WHERE rn = 1
),
ranked_owners AS (
    SELECT *,
        ROW_NUMBER() OVER (
            PARTITION BY noiponoio.notice_of_intent_parcel_uuid
            ORDER BY noio.audit_created_at
        ) AS rn,
        fp.notice_of_intent_submission_uuid as submission_uuid
    FROM alcs.notice_of_intent_owner noio
        JOIN alcs.notice_of_intent_parcel_owners_notice_of_intent_owner noiponoio ON noiponoio.notice_of_intent_owner_uuid = noio.uuid
        JOIN first_parcel_per_submission AS fp ON fp.uuid = noiponoio.notice_of_intent_parcel_uuid
        JOIN alcs.notice_of_intent_submission nois ON nois.uuid = fp.notice_of_intent_submission_uuid
)
SELECT count(*)
FROM ranked_owners
WHERE rn = 1
    AND applicant ILIKE 'unknown';