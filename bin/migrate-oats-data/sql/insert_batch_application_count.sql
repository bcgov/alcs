
SELECT
    count(*)
From
    oats.oats_alr_applications AS oa
    JOIN application_etl AS ae ON oa.alr_application_id = ae.application_id AND ae.duplicated IS false
    