WITH
    insert_count AS (
        SELECT DISTINCT
            oaa.created_guid
        FROM
            oats.oats_alr_applications oaa
            LEFT JOIN alcs."user" u ON oaa.created_guid = u.bceid_guid
        WHERE
            oaa.created_guid IS NOT NULL
            AND u.bceid_guid IS NULL
    )
SELECT
    count(*)
FROM
    insert_count