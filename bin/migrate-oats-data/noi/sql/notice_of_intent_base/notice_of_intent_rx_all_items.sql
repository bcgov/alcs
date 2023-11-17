SELECT
    oa.completion_date,
    oa.accomplishment_code,
    oa.alr_application_id
FROM
    alcs.notice_of_intent noi
    JOIN oats.oats_accomplishments oa ON oa.alr_application_id::TEXT = noi.file_number
    WHERE oa.accomplishment_code IN ('AKC','SAL') AND noi.date_received_all_items IS NULL
    