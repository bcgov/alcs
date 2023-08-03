WITH
    noi_grouped AS (
        SELECT
            oaac.alr_application_id as noi_application_id
        FROM
            oats.oats_alr_appl_components oaac
            JOIN oats.oats_alr_applications oaa ON oaa.alr_application_id = oaac.alr_application_id
        WHERE
            oaa.application_class_code = 'NOI'
        GROUP BY
            oaac.alr_application_id
        HAVING
            count(oaac.alr_application_id) < 2 -- ignore all noi wit multiple components
    )
SELECT
    count(*)
FROM
    noi_grouped ng