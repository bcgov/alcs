WITH when_updated_grouped AS (
    SELECT 
        a.when_updated, 
        a.alr_application_id,
        a.accomplishment_code,
        COUNT(*) OVER (PARTITION BY a.when_updated, a.alr_application_id) as cnt
    FROM 
        oats.oats_accomplishments a
    WHERE a.when_updated IS NOT NULL
), when_updated_with_status AS (
    SELECT 
        when_updated, 
        alr_application_id,
        accomplishment_code,
        cnt
    FROM 
        when_updated_grouped
    WHERE 
        cnt > 1
), completion_grouped AS (
    SELECT 
        wuws.when_updated, 
        wuws.alr_application_id,
        wuws.accomplishment_code,
        COUNT(*) OVER (PARTITION BY oa.completion_date, wuws.alr_application_id) as cnt
    FROM 
        when_updated_with_status wuws
    JOIN oats.oats_accomplishments oa ON oa.alr_application_id = wuws.alr_application_id AND oa.accomplishment_code = wuws.accomplishment_code
    WHERE oa.completion_date IS NOT NULL
), completion_with_status AS (
    SELECT 
        when_updated, 
        alr_application_id,
        accomplishment_code,
        cnt
    FROM 
        completion_grouped
    WHERE 
        cnt > 1
), 
alr_applications_to_exclude AS ( SELECT alr_application_id FROM completion_with_status)
, submitted_under_review AS (
    SELECT astss.submission_uuid AS initial_sub_uuid FROM alcs.application_submission_to_submission_status astss 
    JOIN alcs.application_submission as2 ON as2."uuid"  = astss.submission_uuid AND as2.audit_created_by='oats_etl' AND as2.audit_updated_by IS NULL
    LEFT JOIN alcs.application_submission_review asr ON asr.application_file_number = as2.file_number
    WHERE astss.effective_date IS NOT NULL AND astss.status_type_code IN ('SUBG', 'REVG') AND ( asr.uuid IS NULL OR asr.audit_created_by='oats_etl' AND asr.audit_updated_by IS NULL)
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
-- ranked_statuses will select the latest status based on max completion_date, then when_updated, then when_created for all records per file_number
, ranked_statuses AS (
    SELECT *, 
    ROW_NUMBER() OVER (PARTITION BY file_number ORDER BY COALESCE(completion_date, '0001-01-01') DESC, COALESCE(when_updated, '0001-01-01') DESC, COALESCE(when_created, '0001-01-01') DESC) AS rn
    FROM oats_accomplishments
)
, latest_oats_lfng_status AS (
    SELECT alr_application_id, accomplishment_code, completion_date, when_created, when_updated, revision_count FROM ranked_statuses 
    WHERE rn = 1 
    ORDER BY file_number::bigint
)
SELECT as2.uuid, lols.alr_application_id, accomplishment_code, lols.completion_date, when_created, when_updated, astss.status_type_code, astss.effective_date, asst.weight
FROM alcs.application_submission_to_submission_status astss 
JOIN alcs.application_submission as2 ON as2.uuid = astss.submission_uuid
JOIN alcs.application_submission_status_type asst ON asst.code = astss.status_type_code
JOIN latest_oats_lfng_status lols ON lols.alr_application_id = as2.file_number::bigint
LEFT JOIN alr_applications_to_exclude aate ON aate.alr_application_id = lols.alr_application_id
WHERE astss.effective_date IS NOT NULL AND astss.status_type_code IN ('WRNG', 'INCM', 'RFFG', 'SUBG', 'REVG') AND aate.alr_application_id IS NULL