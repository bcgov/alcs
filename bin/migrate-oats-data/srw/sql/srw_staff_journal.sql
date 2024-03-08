SELECT osj.journal_date, osj.journal_text, osj.revision_count, osj.staff_journal_entry_id, an."uuid" 
FROM oats.oats_staff_journal_entries osj
JOIN alcs.notification an ON an.file_number = osj.alr_application_id::TEXT 
WHERE an.type_code = 'SRW'