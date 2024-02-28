WITH srw_components_grouped AS (
    SELECT oaa.alr_application_id
    FROM oats.alcs_etl_applications_nois oaa
    WHERE oaa.application_class_code = 'NAN'
        and oaa.alr_change_code = 'SRW'
)
SELECT count(*)
FROM srw_components_grouped srwg