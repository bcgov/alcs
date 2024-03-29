SELECT
    count(*)
From
    oats.oats_alr_applications AS oa
    JOIN oats.alcs_etl_application_duplicate AS ae ON oa.alr_application_id = ae.application_id
    AND ae.duplicated IS false
WHERE
    oa.application_class_code in ('LOA','BLK', 'SCH', 'NAN')