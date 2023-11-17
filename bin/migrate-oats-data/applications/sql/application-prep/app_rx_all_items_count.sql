WITH
    insert_count AS (
        SELECT
            aa.file_number
        FROM
            alcs.application aa
            JOIN oats.oats_accomplishments oa ON oa.alr_application_id::TEXT = aa.file_number
        WHERE
            oa.accomplishment_code IN ('AKC', 'SAL')
            AND aa.date_received_all_items IS NULL
        GROUP BY
            aa.file_number
    )
SELECT
    count(*)
FROM
    insert_count