WITH
    apps AS (
        SELECT
            file_number
        FROM
            alcs.application aa
        WHERE
            audit_created_by = 'oats_etl'
    )
SELECT
    count(*)
FROM
    apps