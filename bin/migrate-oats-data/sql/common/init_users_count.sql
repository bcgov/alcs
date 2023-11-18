WITH
    insert_count AS (
        SELECT
            oas.alc_staff_id
        FROM
            oats.oats_alc_staffs oas
        GROUP BY
            oas.alc_staff_id
    )
SELECT
    count(*)
FROM
    insert_count