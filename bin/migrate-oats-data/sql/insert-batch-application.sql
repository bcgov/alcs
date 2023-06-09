
-- Step 1: Perform a lookup to retrieve the applicant's name or organization for each application ID
WITH applicant_lookup AS (
    SELECT
        DISTINCT oaap.alr_application_id AS application_id,
        string_agg(DISTINCT oo.organization_name, ', ') FILTER (
            WHERE
                oo.organization_name IS NOT NULL
        ) AS orgs,
        string_agg(
            DISTINCT concat(op.first_name || ' ' || op.last_name),
            ', '
        ) FILTER (
            WHERE
                op.last_name IS NOT NULL
                OR op.first_name IS NOT NULL
        ) AS persons
    FROM
        oats.oats_alr_application_parties oaap
        LEFT JOIN oats.oats_person_organizations opo ON oaap.person_organization_id = opo.person_organization_id
        LEFT JOIN oats.oats_persons op ON op.person_id = opo.person_id
        LEFT JOIN oats.oats_organizations oo ON opo.organization_id = oo.organization_id
    WHERE
        oaap.alr_appl_role_code = 'APPL'
    GROUP BY
        oaap.alr_application_id
),
-- Step 2: get local gov application name & match to uuid
oats_gov as(
  SELECT
    oaap.alr_application_id AS application_id,
    oo.organization_name AS oats_gov_name

    FROM oats.oats_alr_application_parties oaap
        JOIN oats.oats_person_organizations opo ON oaap.person_organization_id = opo.person_organization_id
        JOIN oats.oats_organizations oo ON opo.organization_id = oo.organization_id
   WHERE
        oo.organization_type_cd = 'MUNI'
),

alcs_gov as(
    SELECT
    oats_gov.application_id AS application_id,
    alg.uuid AS gov_uuid

    FROM oats_gov
        JOIN alcs.application_local_government alg ON oats_gov.oats_gov_name = alg."name"

),    
-- Step 3: Perform a lookup to retrieve the region code for each application ID
panel_lookup AS (
    SELECT
        DISTINCT oaap.alr_application_id AS application_id,
        oo2.organization_name AS panel_region
    FROM
        oats.oats_alr_application_parties oaap
        JOIN oats.oats_person_organizations opo ON oaap.person_organization_id = opo.person_organization_id
        JOIN oats.oats_organizations oo ON opo.organization_id = oo.organization_id
        JOIN oats.oats_organizations oo2 ON oo.parent_organization_id = oo2.organization_id
    WHERE
        oo2.organization_type_cd = 'PANEL'
),
-- Step 4: Perform lookup to retrieve type code
application_type_lookup AS (
    SELECT
        oaac.alr_application_id AS application_id,
        oacc."description" AS "description",
        oaac.alr_change_code AS code

    FROM
        oats.oats_alr_appl_components AS oaac
        JOIN oats.oats_alr_change_codes oacc ON oaac.alr_change_code = oacc.alr_change_code   
)

-- Step 5: Insert new records into the alcs_applications table
SELECT
    oa.alr_application_id :: text AS file_number,

    CASE
        WHEN atl.code = 'TUR' THEN 'TURP'
        WHEN atl.code = 'INC' THEN 'INCL'
        WHEN atl.code = 'EXC' THEN 'EXCL'
        WHEN atl.code = 'SDV' THEN 'SUBD'
        WHEN atl.code = 'NFU' THEN 'NFUP'
        WHEN atl.code = 'SCH' THEN 'PFRS'
        WHEN atl.code = 'EXT' THEN 'ROSO'
        WHEN atl.code = 'FILL' THEN 'POFO'
        -- WHEN atl.code = 'SRW' THEN 'NARU'
        -- WHEN atl.code = 'CSC' THEN 'NARU'
        WHEN atl.code = 'NAR' THEN 'NARU'
        ELSE 'NARU'
    END AS type_code,
    CASE
        WHEN applicant_lookup.orgs IS NOT NULL THEN applicant_lookup.orgs
        WHEN applicant_lookup.persons IS NOT NULL THEN applicant_lookup.persons
        ELSE 'Unknown'
    END AS applicant,
	ar.code as region_code,
    --TODO: local government lookup
    -- CASE
    --     WHEN alcs_gov.gov_uuid IS NOT NULL THEN alcs_gov.gov_uuid
    --     ELSE 'not found' '001cfdad-bc6e-4d25-9294-1550603da980'
    -- END AS local_government_uuid,
    alcs_gov.gov_uuid AS local_government_uuid,
    'oats_etl'
FROM
    oats.oats_alr_applications AS oa
    JOIN oats.application_etl AS ae ON oa.alr_application_id = ae.application_id AND ae.duplicated IS false
    LEFT JOIN applicant_lookup ON oa.alr_application_id = applicant_lookup.application_id
    LEFT JOIN panel_lookup ON oa.alr_application_id = panel_lookup.application_id
    LEFT JOIN application_type_lookup AS atl ON oa.alr_application_id = atl.application_id
	LEFT JOIN alcs.application_region ar ON panel_lookup.panel_region = ar."label"
    LEFT JOIN alcs_gov ON oa.alr_application_id = alcs_gov.application_id
    LEFT JOIN oats.oats2alcs_etl_exclude aee ON oa.alr_application_id = aee.application_id
     
where aee.application_id is null