SELECT
    COUNT(*)
FROM
    oats.oats_issue_notes oin
    JOIN alcs.inquiry i ON i.file_number = oin.issue_id::TEXT