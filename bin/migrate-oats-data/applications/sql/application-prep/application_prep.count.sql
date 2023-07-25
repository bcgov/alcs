WITH appl_components_grouped AS (
    SELECT oaac.alr_application_id
    FROM oats.oats_alr_appl_components oaac
        JOIN oats.oats_alr_applications oaa ON oaa.alr_application_id = oaac.alr_application_id
    WHERE oaa.application_class_code IN ('LOA', 'BLK')
    GROUP BY oaac.alr_application_id
    HAVING count(oaac.alr_application_id) < 2 -- ignore all applications wit multiple components
)
SELECT count(*)
FROM appl_components_grouped acg