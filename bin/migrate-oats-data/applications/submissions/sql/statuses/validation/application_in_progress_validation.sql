--- run it manually in IDE of your choice
--- compare to numbers returned by script. They should match
-- total count of set 'PROG' - In Progress in ALCS
SELECT count(*)
FROM alcs.application_submission_to_submission_status appstss
    JOIN alcs.application_submission as2 ON as2.uuid = appstss.submission_uuid
WHERE appstss.status_type_code = 'PROG'
    AND effective_date IS NOT NULL
    AND as2.audit_created_by = 'oats_etl';
--total count of set 'INP' - In Progress apps with one or zero components in OATS
WITH inp_accomplishment_per_file_number AS (
    SELECT alr_application_id,
        accomplishment_code
    FROM oats.oats_accomplishments oa
    WHERE accomplishment_code = 'INP'
    GROUP BY alr_application_id,
        accomplishment_code
),
inp_accomplishments_for_app_only AS (
    SELECT DISTINCT ON (
            inp_accomplishments.accomplishment_code,
            oaa.alr_application_id,
            oaa.when_created
        ) inp_accomplishments.accomplishment_code,
        oaa.alr_application_id,
        oaa.when_created
    FROM oats.oats_alr_applications oaa
        LEFT JOIN inp_accomplishment_per_file_number AS inp_accomplishments ON inp_accomplishments.alr_application_id = oaa.alr_application_id
    WHERE oaa.application_class_code IN ('LOA', 'BLK', 'SCH', 'NAN')
        AND (oaa.when_created IS NOT NULL)
),
apps_with_one_or_zero_component_only AS (
    SELECT oaa.alr_application_id,
        oaa.alr_appl_component_id
    FROM oats.alcs_etl_applications_nois oaa
    WHERE oaa.application_class_code IN ('LOA', 'BLK', 'SCH', 'NAN')
        and oaa.alr_change_code <> 'SRW'
),
all_in_progress AS (
    SELECT inp.alr_application_id
    FROM inp_accomplishments_for_app_only AS inp
        JOIN apps_with_one_or_zero_component_only AS apps_one_or_zero ON apps_one_or_zero.alr_application_id = inp.alr_application_id
    GROUP BY inp.alr_application_id
)
SELECT count(*)
FROM all_in_progress;