SELECT
    oin.note_text,
    oin.note_date,
    oin.revision_count,
    oin.issue_note_id,
    i."uuid"
FROM
    oats.oats_issue_notes oin
    JOIN alcs.inquiry i ON i.file_number = oin.issue_id::TEXT 