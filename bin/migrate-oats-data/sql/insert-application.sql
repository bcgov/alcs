-- Step 1: Create helper table to lookup guids and deal with duplicates
DROP TABLE IF EXISTS application_etl;

CREATE TEMPORARY TABLE application_etl (
    id SERIAL PRIMARY KEY,
    application_id int,
    card_uuid UUID NOT NULL DEFAULT gen_random_uuid(),
    duplicated bool DEFAULT false
);

INSERT INTO
    application_etl (application_id, duplicated)
SELECT
    DISTINCT oa.alr_application_id AS application_id,
    CASE
        WHEN a.uuid IS NOT NULL THEN TRUE
        ELSE false
    END AS duplicated
FROM
    oats.oats_alr_applications AS oa
    LEFT JOIN alcs.application AS a ON oa.alr_application_id :: text = a.file_number;

-- Step 2: Create associated card
INSERT INTO
    alcs.card (uuid, audit_created_by)
SELECT
    ae.card_uuid,
    'oats_etl'
FROM
    application_etl ae
WHERE
    ae.duplicate IS false;

-- Step 3: Perform a lookup to retrieve the applicant's name or organization for each application ID
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
-- Step 4: Perform a lookup to retrieve the region code for each application ID
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
) -- Step 5: Insert new records into the alcs_applications table
INSERT INTO
    alcs.application (
        file_number,
        card_uuid,
        type_code,
        applicant,
        region_code,
        local_government_uuid,
        audit_created_by
    )
SELECT
    oa.alr_application_id :: text AS file_number,
    ae.card_uuid AS card_uuid,
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
    JOIN application_etl AS ae ON oa.alr_application_id = ae.application_id
    LEFT JOIN applicant_lookup ON oa.alr_application_id = applicant_lookup.application_id
    LEFT JOIN panel_lookup ON oa.alr_application_id = panel_lookup.application_id
WHERE
    ae.duplicate IS false;