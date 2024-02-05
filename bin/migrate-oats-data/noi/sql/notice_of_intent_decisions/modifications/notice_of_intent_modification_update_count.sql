WITH alcs_modifications_resulting_decisions AS (
    SELECT noim."uuid",
        noim.submitted_date::DATE AS submitted_date,
        noid.resolution_number,
        noid.resolution_year,
        noid.oats_alr_appl_decision_id,
        noi.file_number,
        noim.audit_created_by
    FROM alcs.notice_of_intent_modification noim
        LEFT JOIN alcs.notice_of_intent_decision noid ON noid.modifies_uuid = noim."uuid" -- TODO will remove this comment after PROD QA with Ansley
        JOIN alcs.notice_of_intent noi ON noi."uuid" = noim.notice_of_intent_uuid
)
SELECT count(*)
FROM oats.oats_reconsideration_requests orr
    LEFT JOIN oats.oats_alr_appl_decisions oaad ON oaad.reconsideration_request_id = orr.reconsideration_request_id
    JOIN alcs.notice_of_intent noi ON noi.file_number = orr.alr_application_id::TEXT -- this IS required to get oats_recons only for nois
    LEFT JOIN alcs_modifications_resulting_decisions AS amrd ON (
        (
            amrd.oats_alr_appl_decision_id = oaad.alr_appl_decision_id
            AND amrd.submitted_date = orr.received_date::DATE
        )
        OR (
            amrd.submitted_date = orr.received_date::DATE
            AND amrd.file_number = orr.alr_application_id::TEXT
        )
    )
WHERE amrd."uuid" IS NOT NULL
    AND amrd.audit_created_by <> 'oats_etl'