SELECT count (*)
FROM oats.oats_staff_journal_entries AS osj
JOIN alcs.notice_of_intent AS anoi ON anoi.file_number = osj.alr_application_id::TEXT 