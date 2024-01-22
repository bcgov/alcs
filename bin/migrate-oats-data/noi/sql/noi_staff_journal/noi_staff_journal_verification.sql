WITH alcs_rows AS (
	SELECT asj.application_uuid, anoi.file_number, asj.body
	FROM alcs.staff_journal AS asj
	JOIN alcs.notice_of_intent AS anoi on asj.notice_of_intent_uuid = anoi."uuid"
	WHERE asj.audit_created_by = 'oats_etl'
	),
	oats_rows AS (
	SELECT osje.alr_application_id, osje.journal_text
	FROM oats.oats_staff_journal_entries AS osje
	JOIN oats.oats_alr_applications AS oaa ON osje.alr_application_id = oaa.alr_application_id
	WHERE oaa.application_class_code = 'NOI'
)
SELECT oar.journal_text, oar.alr_application_id, ar.file_number
FROM oats_rows AS oar
JOIN alcs_rows AS ar ON oar.journal_text = ar.body
WHERE ar.file_number <> oar.alr_application_id::TEXT;