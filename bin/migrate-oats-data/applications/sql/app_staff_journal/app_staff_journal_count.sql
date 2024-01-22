SELECT count (*)
FROM oats.oats_staff_journal_entries osj
JOIN alcs.application aa ON aa.file_number = osj.alr_application_id::TEXT 