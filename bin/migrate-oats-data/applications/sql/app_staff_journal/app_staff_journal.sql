SELECT osj.journal_date, osj.journal_text, osj.revision_count, osj.staff_journal_entry_id, aa."uuid" 
FROM oats.oats_staff_journal_entries osj
JOIN alcs.application aa ON aa.file_number = osj.alr_application_id::TEXT 