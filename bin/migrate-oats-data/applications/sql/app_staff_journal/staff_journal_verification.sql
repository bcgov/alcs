WITH alcs_rows AS (
	SELECT sj.application_uuid, aa.file_number, sj.body
	FROM alcs.staff_journal sj
	JOIN alcs.application aa on sj.application_uuid = aa."uuid"
	WHERE sj.audit_created_by = 'oats_etl'
	),
	oats_rows AS (
	SELECT osje.alr_application_id, osje.journal_text
	FROM oats.oats_staff_journal_entries osje
	JOIN oats.oats_alr_applications oaa ON osje.alr_application_id = oaa.alr_application_id
	WHERE oaa.application_class_code IN ('LOA', 'BLK')
)
SELECT oar.journal_text, oar.alr_application_id, ar.file_number
FROM oats_rows oar
JOIN alcs_rows ar ON oar.journal_text = ar.body
WHERE ar.file_number <> oar.alr_application_id::TEXT;