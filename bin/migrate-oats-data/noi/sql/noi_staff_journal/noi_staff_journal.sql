SELECT osj.journal_date, osj.journal_text, osj.revision_count, osj.staff_journal_entry_id, anoi."uuid" 
FROM oats.oats_staff_journal_entries AS osj
JOIN alcs.notice_of_intent AS anoi ON anoi.file_number = osj.alr_application_id::TEXT 