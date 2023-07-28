WITH
    noi_grouped AS (
        SELECT
            oaac.alr_application_id
        FROM
            oats.oats_alr_appl_components oaac
            JOIN oats.oats_alr_applications oaa ON oaa.alr_application_id = oaac.alr_application_id
        WHERE
            oaa.application_class_code IN ('NOI')
        GROUP BY
            oaac.alr_application_id
        HAVING
            count(oaac.alr_application_id) < 2 -- ignore all applications wit multiple components
    )
SELECT
    oaa.alr_application_id,
    oaac.alr_change_code
FROM
    noi_grouped noi
    JOIN oats.oats_alr_appl_components oaac ON oaac.alr_application_id = noi.alr_application_id
    JOIN oats.oats_alr_applications oaa ON oaa.alr_application_id = noi.alr_application_id