WITH reject_refuse AS (
  SELECT
    oa.rejected_by_lg_date,
    oa2.accomplishment_code,
    oa2.completion_date,
    oa.alr_application_id,
    apps.uuid,
    ROW_NUMBER() OVER (PARTITION BY oa.alr_application_id ORDER BY oa.rejected_by_lg_date) AS rn
    FROM alcs.application_submission_to_submission_status apstss
    JOIN alcs.application_submission apps ON apps.uuid = apstss.submission_uuid
	JOIN oats.oats_alr_applications oa ON apps.file_number = oa.alr_application_ID::TEXT
    JOIN oats.oats_accomplishments oa2 ON oa.alr_application_id = oa2.alr_application_id
  WHERE
    oa.rejected_by_lg_date IS NOT NULL OR oa2.accomplishment_code = 'LRF'
)
SELECT
  rejected_by_lg_date,
  accomplishment_code,
  completion_date,
  alr_application_id,
  uuid
FROM
  reject_refuse
WHERE
  rn = 1