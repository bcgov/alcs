WITH
    insert_count AS (
        SELECT
            noi.file_number
        FROM
            alcs.notice_of_intent noi
            JOIN oats.oats_accomplishments oa ON oa.alr_application_id::TEXT = noi.file_number
        WHERE
            oa.accomplishment_code IN ('AKC', 'SAL')
            AND noi.date_received_all_items IS NULL
        GROUP BY
            noi.file_number
    )
SELECT
    count(*)
FROM
    insert_count