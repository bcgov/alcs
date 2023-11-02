--- run it manually in IDE of your choice
--- compare to numbers returned by script. They should match
-- total count of set 'SUIN' - Submitted to ALC Incomplete status in ALCS
SELECT
    count(*)
FROM
    alcs.application_submission_to_submission_status appstss
    JOIN alcs.application_submission as2 ON as2.uuid = appstss.submission_uuid
WHERE
    status_type_code = 'SUIN'
    AND effective_date IS NOT NULL
    AND as2.audit_created_by = 'oats_etl';

-- total count of expected 'AKI' - Submitted to ALC Incomplete status
WITH
    app_components_grouped AS (
        SELECT
            oaac.alr_application_id
        FROM
            oats.oats_alr_appl_components oaac
            JOIN oats.oats_alr_applications oaa ON oaa.alr_application_id = oaac.alr_application_id
        WHERE
            oaa.application_class_code IN ('LOA', 'BLK')
        GROUP BY
            oaac.alr_application_id
        HAVING
            count(oaac.alr_application_id) < 2 -- ignore notice of intents with multiple components
    )
SELECT
    count(*)
FROM
    app_components_grouped ncg
    JOIN oats.oats_accomplishments oa ON oa.alr_application_id = ncg.alr_application_id
    AND oa.accomplishment_code = 'AKI'
    AND oa.completion_date IS NOT NULL;