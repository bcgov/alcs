-- select latest OATS government status
WITH submitted_under_review AS (
    SELECT astss.submission_uuid AS initial_sub_uuid FROM alcs.application_submission_to_submission_status astss 
    JOIN alcs.application_submission as2 ON as2."uuid"  = astss.submission_uuid AND as2.audit_created_by='oats_etl' AND as2.audit_updated_by IS NULL
    WHERE astss.effective_date IS NOT NULL AND astss.status_type_code IN ('SUBG', 'REVG')
    GROUP BY astss.submission_uuid
)
, returned_incomplete_refused AS (
    SELECT as2.file_number, string_agg(astss.status_type_code, ', ')
    FROM submitted_under_review sur
    JOIN alcs.application_submission_to_submission_status astss ON astss.submission_uuid = sur.initial_sub_uuid
    JOIN alcs.application_submission as2 ON as2.uuid = astss.submission_uuid
    WHERE astss.effective_date IS NOT NULL AND astss.status_type_code IN ('WRNG', 'INCM', 'RFFG', 'SUBG', 'REVG')
    GROUP BY as2.file_number
)
, oats_accomplishments AS (
    SELECT rir.*, oaac.* FROM oats.oats_accomplishments oaac 
    JOIN returned_incomplete_refused AS rir ON rir.file_number::bigint = oaac.alr_application_id
    WHERE oaac.accomplishment_code IN ('LRF', 'SLG', 'WLG', 'ULG', 'LGI')
)
-- ranked_statuses will select the latest status based on max between when_created or when_updated for all records per file_number
, ranked_statuses AS (
    SELECT *, GREATEST(COALESCE(when_created, '0001-01-01'), COALESCE(when_updated, '0001-01-01')) AS max_date, ROW_NUMBER() OVER (PARTITION BY file_number ORDER BY GREATEST(COALESCE(when_created, '0001-01-01'), COALESCE(when_updated, '0001-01-01')) DESC) AS rn
    FROM oats_accomplishments
)
, latest_oats_lfng_status AS (
    SELECT * FROM ranked_statuses 
    WHERE 
    rn = 1 
    ORDER BY file_number::bigint
)
SELECT count(*) FROM latest_oats_lfng_status
