DROP TABLE IF EXISTS oats.alcs_etl_srw_duplicate;
CREATE TABLE oats.alcs_etl_srw_duplicate (
    id SERIAL PRIMARY KEY,
    application_id BIGINT,
    duplicated bool DEFAULT false
);
-- function creates table to contain duplicate type code srw ids
DROP TABLE IF EXISTS oats.alcs_etl_srw_exclude;
CREATE TABLE oats.alcs_etl_srw_exclude (
    component_id BIGINT,
    application_id BIGINT
);
DROP TABLE IF EXISTS oats.alcs_etl_srw;
CREATE TABLE oats.alcs_etl_srw (
    alr_application_id BIGINT,
    alr_appl_component_id BIGINT,
    alr_change_code TEXT,
    application_class_code TEXT
);
-- function inserts data into previously created table and deciphers duplication of uuids
-- application_id is copied from oats.oats_alr_applications.alr_application_id
INSERT INTO oats.alcs_etl_srw_duplicate (application_id, duplicated)
SELECT DISTINCT oa.alr_application_id AS application_id,
    CASE
        WHEN ntf.uuid IS NOT NULL THEN TRUE
        ELSE false
    END AS duplicated
FROM oats.oats_alr_applications AS oa
    LEFT JOIN alcs.notification AS ntf ON oa.alr_application_id::TEXT = ntf.file_number;
-- Insert values from application-exclude into table
INSERT INTO oats.alcs_etl_srw_exclude (component_id, application_id) WITH application_type_lookup AS (
        SELECT oaac.alr_application_id AS application_id,
            oaac.alr_change_code AS code
        FROM oats.oats_alr_appl_components AS oaac
        WHERE oaac.alr_change_code = 'SRW'
    ),
    -- Find instances of multi-component applications 
    multi_app AS (
        SELECT atl.application_id AS app_id
        FROM application_type_lookup atl
        GROUP BY atl.application_id
        HAVING count(application_id) > 1
    ),
    duplicate_ids AS (
        SELECT alr_application_id,
            alr_appl_component_id,
            alr_change_code
        FROM oats.oats_alr_appl_components oaac
            RIGHT JOIN multi_app ON oaac.alr_application_id = multi_app.app_id
    ),
    -- Order based on established hierarchy 
    ranked_rows AS (
        SELECT alr_appl_component_id,
            ROW_NUMBER() OVER (
                PARTITION BY dis.alr_application_id
                ORDER BY CASE
                        dis.alr_change_code
                        WHEN 'EXC' THEN 1
                        WHEN 'INC' THEN 2
                        WHEN 'SDV' THEN 3
                        WHEN 'SCH' THEN 4
                        WHEN 'NFU' THEN 5
                        WHEN 'CSC' THEN 6
                        ELSE 7
                    END
            ) AS rank,
            dis.alr_application_id
        FROM duplicate_ids dis
    ) -- select all components that will not be inserted
SELECT rr.alr_appl_component_id,
    rr.alr_application_id
FROM ranked_rows rr
WHERE rank != 1;
-- populate srw that will be inserted
INSERT INTO oats.alcs_etl_srw (
        alr_application_id,
        alr_appl_component_id,
        alr_change_code,
        application_class_code
    ) WITH components_minus_excluded_components AS (
        SELECT *
        FROM oats.oats_alr_appl_components oaac
            LEFT JOIN oats.alcs_etl_srw_exclude excl ON excl.component_id = oaac.alr_appl_component_id
        WHERE excl.component_id IS NULL
    ),
    filtered_to_single_componets_srw AS (
        SELECT oaa.alr_application_id,
            cec.alr_appl_component_id,
            cec.alr_change_code,
            oaa.application_class_code
        FROM components_minus_excluded_components cec
            JOIN oats.oats_alr_applications oaa ON oaa.alr_application_id = cec.alr_application_id
        WHERE oaa.application_class_code IN ('LOA', 'BLK', 'SCH', 'NAN', 'NOI')
            AND cec.alr_change_code = 'SRW'
    )
SELECT fsrw.alr_application_id,
    fsrw.alr_appl_component_id,
    fsrw.alr_change_code,
    fsrw.application_class_code
FROM filtered_to_single_componets_srw fsrw;