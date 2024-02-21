WITH alcs_reconsiderations_resulting_decisions AS (
    SELECT appr."uuid" as reconsideration_uuid,
        appr.submitted_date::DATE AS submitted_date,
        appd.resolution_number,
        appd.resolution_year,
        appd.oats_alr_appl_decision_id,
        appr.audit_created_by,
        app.file_number
    FROM alcs.application_reconsideration appr
        LEFT JOIN alcs.application_decision appd ON appd.reconsiders_uuid = appr."uuid"
        JOIN alcs.application app ON app."uuid" = appr.application_uuid
),
alcs_modifications AS (
    SELECT appm."uuid",
        appm.submitted_date::DATE AS submitted_date,
        appd.resolution_number,
        appd.resolution_year,
        appd.oats_alr_appl_decision_id
    FROM alcs.application_modification appm
        LEFT JOIN alcs.application_decision appd ON appd.reconsiders_uuid = appm."uuid"
        JOIN alcs.application app ON app."uuid" = appm.application_uuid
)
SELECT count(*)
FROM oats.oats_reconsideration_requests orr
    LEFT JOIN oats.oats_alr_appl_decisions oaad ON oaad.reconsideration_request_id = orr.reconsideration_request_id
    JOIN alcs.application app ON app.file_number = orr.alr_application_id::TEXT -- this IS required to get oats_recons only for apps
    LEFT JOIN alcs_reconsiderations_resulting_decisions AS arrd ON (
        (
            arrd.oats_alr_appl_decision_id = oaad.alr_appl_decision_id
            AND arrd.submitted_date = orr.received_date::DATE
        )
        OR (
            arrd.submitted_date = orr.received_date::DATE
            AND arrd.file_number = orr.alr_application_id::TEXT
        )
    )
    LEFT JOIN alcs_modifications AS appm ON (
        (
            appm.oats_alr_appl_decision_id = oaad.alr_appl_decision_id
            AND appm.submitted_date = orr.received_date::DATE
        )
        OR (
            appm.submitted_date = orr.received_date::DATE
            AND arrd.file_number = orr.alr_application_id::TEXT
        )
    )
WHERE arrd.audit_created_by <> 'oats_etl'
    AND appm."uuid" IS NULL