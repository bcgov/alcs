SELECT
    oa.completion_date,
    oa.accomplishment_code,
    oa.alr_application_id
FROM
    alcs.notice_of_intent noi
    JOIN oats.oats_accomplishments oa ON oa.alr_application_id::TEXT = noi.file_number
    JOIN oats.oats_alr_applications oaa ON noi.file_number = oaa.alr_application_id::TEXT
    WHERE oa.accomplishment_code IN ('AKC','SAL') AND noi.date_received_all_items IS NULL
    AND oaa.who_created IN ('PROXY_OATS_LOCGOV','PROXY_OATS_APPLICANT')
    