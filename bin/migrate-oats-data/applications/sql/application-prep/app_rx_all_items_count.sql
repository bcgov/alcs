SELECT
    count(*)
FROM
    alcs.application aa
    JOIN oats.oats_accomplishments oa ON oa.alr_application_id::TEXT = aa.file_number
WHERE
    oa.accomplishment_code IN ('AKC', 'SAL')
    AND aa.date_received_all_items IS NULL
    