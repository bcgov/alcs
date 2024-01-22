--- run it manually in IDE of your choice
--- compare to numbers returned by script.
-- total count of set 'SUBG' - Submitted to LFNG in ALCS
SELECT count(*)
FROM alcs.application_submission_to_submission_status appstss
    JOIN alcs.application_submission as2 ON as2.uuid = appstss.submission_uuid
WHERE appstss.status_type_code = 'SUBG'
    AND effective_date IS NOT NULL
    AND as2.audit_created_by = 'oats_etl';
--total count of set 'SLG' apps with one or zero components in OATS 
WITH last_sub_lg_accomplishment_per_file_number AS (
    SELECT alr_application_id,
        accomplishment_code,
        MAX(oa.completion_date) AS completion_date
    FROM oats.oats_accomplishments oa
    WHERE accomplishment_code = 'SLG'
    GROUP BY alr_application_id,
        accomplishment_code
),
sub_lg_accomplishments_for_app_only AS (
    SELECT DISTINCT ON (
            last_sub_lg.accomplishment_code,
            last_sub_lg.completion_date,
            oaa.alr_application_id,
            oaa.submitted_to_lg_date
        ) last_sub_lg.accomplishment_code,
        last_sub_lg.completion_date,
        oaa.alr_application_id,
        oaa.submitted_to_lg_date
    FROM oats.oats_alr_applications oaa
        LEFT JOIN last_sub_lg_accomplishment_per_file_number AS last_sub_lg ON last_sub_lg.alr_application_id = oaa.alr_application_id
    WHERE oaa.application_class_code IN ('LOA', 'BLK', 'SCH', 'NAN')
        AND (
            last_sub_lg.completion_date IS NOT NULL
            OR oaa.submitted_to_lg_date IS NOT NULL
        )
),
apps_with_one_or_zero_component_only AS (
    SELECT oaa.alr_application_id,
        oaa.alr_appl_component_id
    FROM oats.alcs_etl_applications_nois oaa
    WHERE oaa.application_class_code IN ('LOA', 'BLK', 'SCH', 'NAN')
        and oaa.alr_change_code <> 'SRW'
),
all_sub_lg AS (
    SELECT sub_lg.alr_application_id
    FROM sub_lg_accomplishments_for_app_only AS sub_lg
        JOIN apps_with_one_or_zero_component_only AS apps_one_or_zero ON apps_one_or_zero.alr_application_id = sub_lg.alr_application_id
    GROUP BY sub_lg.alr_application_id
)
SELECT count(*)
FROM all_sub_lg