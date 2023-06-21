
    
    -- function creates a temporary table to be used by .sql files called later in script
DROP TABLE IF EXISTS oats.alcs_etl_application_duplicate;

CREATE TABLE oats.alcs_etl_application_duplicate (
    id SERIAL PRIMARY KEY,
    application_id int,
    card_uuid UUID NOT NULL DEFAULT gen_random_uuid(),
    duplicated bool DEFAULT false
);
    


    
--function creates table to contain duplicate type code app ids
DROP TABLE IF EXISTS oats.alcs_etl_application_exclude;

CREATE TABLE oats.alcs_etl_application_exclude (
    component_id int
);
    
-- function inserts data into prevoisly created table and decipers duplication of uuids
-- application_id is copied from oats.oats_alr_applications.alr_application_id
INSERT INTO
            oats.alcs_etl_application_duplicate (application_id, duplicated)
        SELECT
            DISTINCT oa.alr_application_id AS application_id,
            CASE
                WHEN a.uuid IS NOT NULL THEN TRUE
                ELSE false
            END AS duplicated
        FROM
            oats.oats_alr_applications AS oa
            LEFT JOIN alcs.application AS a ON oa.alr_application_id :: text = a.file_number;
    
    
-- Insert values from application-exclude into table
INSERT INTO oats.alcs_etl_application_exclude (component_id)
 WITH application_type_lookup AS (
            SELECT
                oaac.alr_application_id AS application_id,
                oaac.alr_change_code AS code
        
            FROM
                oats.oats_alr_appl_components AS oaac
                ),
   
   multi_app as (    
    SELECT 
            atl.application_id as app_id
    FROM application_type_lookup atl
        GROUP BY atl.application_id 
        HAVING count(application_id) > 1
        ),
  duplicate_ids as (      
    select *
    from oats.oats_alr_appl_components oaac
    right join multi_app on oaac.alr_application_id = multi_app.app_id
    ),
  
    ranked_rows AS (
    SELECT *,
           ROW_NUMBER() OVER (PARTITION BY dis.alr_application_id ORDER BY
               CASE dis.alr_change_code
                   WHEN 'EXC' THEN 1
                   WHEN 'INC' THEN 2
                   WHEN 'SDV' THEN 3
                   WHEN 'SCH' THEN 4
                   WHEN 'NFU' THEN 5
                   ELSE 6
               END) AS rank
    FROM duplicate_ids dis
    )
    
    select rr.alr_appl_component_id
    from ranked_rows rr
    where rank != 1;
   