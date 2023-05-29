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
-- Step 2: Perform a lookup to retrieve the region code for each application ID
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
) 
-- Step 3: Insert new records into the alcs_applications table
SELECT
    oa.alr_application_id :: text AS file_number,
    -- TODO: type code lookup
    'NARU',
    CASE
        WHEN applicant_lookup.orgs IS NOT NULL THEN applicant_lookup.orgs
        WHEN applicant_lookup.persons IS NOT NULL THEN applicant_lookup.persons
        ELSE 'Unknown'
    END AS applicant,
    -- TODO: panel region lookup
    'INTR',
    --Peace river TODO: local government lookup
    '001cfdad-bc6e-4d25-9294-1550603da980',
    'oats_etl'
FROM
    oats.oats_alr_applications AS oa
    JOIN application_etl AS ae ON oa.alr_application_id = ae.application_id AND ae.duplicated IS false
    LEFT JOIN applicant_lookup ON oa.alr_application_id = applicant_lookup.application_id
    LEFT JOIN panel_lookup ON oa.alr_application_id = panel_lookup.application_id
