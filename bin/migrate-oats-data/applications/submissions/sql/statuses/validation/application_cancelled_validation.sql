--- run it manually in IDE of your choice
--- compare to numbers returned by script.
-- total count of set 'CANC' - cancelled in ALCS
SELECT
    count(*)
FROM
    alcs.application_submission_to_submission_status appstss
    JOIN alcs.application_submission as2 ON as2.uuid = appstss.submission_uuid
WHERE
    appstss.status_type_code = 'CANC'
    AND effective_date IS NOT NULL
    AND as2.audit_created_by = 'oats_etl';

--total count of set 'CAN' apps with one or zero components in OATS 
WITH
    first_cancelled_accomplishment_per_file_number AS (
        SELECT
            alr_application_id,
            accomplishment_code,
            MIN(oa.completion_date) AS completion_date
        FROM
            oats.oats_accomplishments oa
        WHERE
            accomplishment_code = 'CAN'
        GROUP BY
            alr_application_id,
            accomplishment_code
    ),
    cancelled_accomplishments_for_app_only AS (
        SELECT DISTINCT
            ON (
                first_cancelled.accomplishment_code,
                first_cancelled.completion_date,
                oaa.alr_application_id,
                oaa.cancelled_date
            ) first_cancelled.accomplishment_code,
            first_cancelled.completion_date,
            oaa.alr_application_id,
            oaa.cancelled_date
        FROM
            oats.oats_alr_applications oaa
            LEFT JOIN first_cancelled_accomplishment_per_file_number AS first_cancelled ON first_cancelled.alr_application_id = oaa.alr_application_id
        WHERE
            oaa.application_class_code IN ('LOA', 'BLK')
            AND (
                first_cancelled.completion_date IS NOT NULL
                OR oaa.cancelled_date IS NOT NULL
            )
    ),
    apps_with_one_or_zero_component_only AS (
        SELECT
            oaac.alr_application_id,
            max(oaac.alr_appl_component_id) AS alr_appl_component_id -- this IS NOT going TO effect the query since count < 2
        FROM
            oats.oats_alr_appl_components oaac
            JOIN oats.oats_alr_applications oaa ON oaa.alr_application_id = oaac.alr_application_id
            AND oaa.application_class_code IN ('LOA', 'BLK')
        GROUP BY
            oaac.alr_application_id
        HAVING
            count(oaac.alr_application_id) < 2
    ),
    all_cancelled AS (
        SELECT
            cancelled.alr_application_id
        FROM
            cancelled_accomplishments_for_app_only AS cancelled
            JOIN apps_with_one_or_zero_component_only AS apps_one_or_zero ON apps_one_or_zero.alr_application_id = cancelled.alr_application_id
        GROUP BY
            cancelled.alr_application_id
    )
SELECT
    count(*)
FROM
    all_cancelled