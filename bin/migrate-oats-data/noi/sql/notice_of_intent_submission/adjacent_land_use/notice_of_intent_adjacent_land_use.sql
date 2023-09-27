WITH nois_with_one_or_zero_component_only AS (
    SELECT oaac.alr_application_id,
        max(oaac.alr_appl_component_id) AS alr_appl_component_id -- this IS NOT going TO effect the query since count < 2
    FROM oats.oats_alr_appl_components oaac
        JOIN oats.oats_alr_applications oaa ON oaa.alr_application_id = oaac.alr_application_id
        AND oaa.application_class_code = 'NOI'
    GROUP BY oaac.alr_application_id
    HAVING count(oaac.alr_application_id) < 2
)
SELECT *
FROM oats.oats_adjacent_land_uses oalu
    JOIN nois_with_one_or_zero_component_only ON oalu.alr_application_id = nois_with_one_or_zero_component_only.alr_application_id