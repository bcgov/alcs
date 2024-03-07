SELECT count (*)
FROM oats.oats_staff_journal_entries osj
JOIN alcs.notification an ON an.file_number = osj.alr_application_id::TEXT 