WITH
    insert_count AS (
        SELECT DISTINCT
            oaa.created_guid
        FROM
            oats.oats_alr_applications oaa
        WHERE
            oaa.created_guid IS NOT NULL
    )
SELECT
    count(*)
FROM
    insert_count