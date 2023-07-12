-- Step 1: Perform a lookup to retrieve the applicant's name or organization for each application ID
WITH
    applicant_lookup AS (
        SELECT DISTINCT
            oaap.alr_application_id AS application_id,
            string_agg (DISTINCT oo.organization_name, ', ') FILTER (
                WHERE
                    oo.organization_name IS NOT NULL
            ) AS orgs,
            string_agg (
                DISTINCT concat (op.first_name || ' ' || op.last_name),
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
    oats_gov AS (
        SELECT
            oaap.alr_application_id AS application_id,
            oo.organization_name AS oats_gov_name
        FROM
            oats.oats_alr_application_parties oaap
            JOIN oats.oats_person_organizations opo ON oaap.person_organization_id = opo.person_organization_id
            JOIN oats.oats_organizations oo ON opo.organization_id = oo.organization_id
        WHERE
            oo.organization_type_cd IN ('MUNI','FN','RD')
    ),
    alcs_gov AS (
        SELECT
            oats_gov.application_id AS application_id,
            alg.uuid AS gov_uuid
        FROM
            oats_gov
            JOIN alcs.application_local_government alg on (
                CASE
                    WHEN oats_gov.oats_gov_name LIKE 'Islands Trust Gabriola Island' THEN 'Islands Trust Gabriola Island (Historical)'
                    WHEN oats_gov.oats_gov_name LIKE 'Islands Trust Galiano Island' THEN 'Islands Trust Galiano Island (Historical)'
                    WHEN oats_gov.oats_gov_name LIKE 'Islands Trust Gambier Island' THEN 'Islands Trust Gambier Island (Historical)'
                    WHEN oats_gov.oats_gov_name LIKE 'Islands Trust Hornby Island' THEN 'Islands Trust Hornby Island (Historical)'
                    WHEN oats_gov.oats_gov_name LIKE 'Islands Trust Lasqueti Island' THEN 'Islands Trust Lasqueti Island (Historical)'
                    WHEN oats_gov.oats_gov_name LIKE 'Islands Trust Mayne Island' THEN 'Islands Trust Mayne Island (Historical)'
                    WHEN oats_gov.oats_gov_name LIKE 'Islands Trust Pender Island' THEN 'Islands Trust Pender Island (Historical)'
                    WHEN oats_gov.oats_gov_name LIKE 'Islands Trust Quadra Island' THEN 'Islands Trust Quadra Island (Historical)'
                    WHEN oats_gov.oats_gov_name LIKE 'Islands Trust Salt Spring Island' THEN 'Islands Trust Salt Spring Island (Historical)'
                    WHEN oats_gov.oats_gov_name LIKE 'Islands Trust Saturna Island' THEN 'Islands Trust Saturna Island (Historical)'
                    WHEN oats_gov.oats_gov_name LIKE 'Islands Trust Sidney Island' THEN 'Islands Trust Sidney Island (Historical)'
                    WHEN oats_gov.oats_gov_name LIKE 'Islands Trust- Comox Strathcona' THEN 'Islands Trust Comox Strathcona (Historical)'
                    WHEN oats_gov.oats_gov_name LIKE 'Islands Trust- Nanaimo' THEN 'Islands Trust Nanaimo (Historical)'
                    WHEN oats_gov.oats_gov_name LIKE 'Islands Trust-Capital' THEN 'Islands Trust Capital (Historical)'
                    WHEN oats_gov.oats_gov_name LIKE 'Islands Trust-Powell River' THEN 'Islands Trust Powell River (Historical)'
                    WHEN oats_gov.oats_gov_name LIKE 'Islands Trust-Sunshine Coast' THEN 'Islands Trust Sunshine Coast (Historical)'
                    WHEN oats_gov.oats_gov_name LIKE 'Islands Trust Bowen Island' THEN 'Bowen Island (Island Municipality)'
                    WHEN oats_gov.oats_gov_name LIKE 'Islands Trust Denman Island' THEN 'Islands Trust Denman Island (Historical)'
                    WHEN oats_gov.oats_gov_name LIKE 'Islands Trust - Cowichan Valley' THEN 'Islands Trust Cowichan Valley (Historical)'
                    WHEN oats_gov.oats_gov_name LIKE 'Northern Rockies' THEN 'Northern Rockies (Historical)'
                    WHEN oats_gov.oats_gov_name LIKE 'Sliammon%' THEN 'Tla''amin Nation'
                    WHEN oats_gov.oats_gov_name LIKE 'Thompson Nicola%' THEN 'Thompson Nicola Regional District'
                    WHEN oats_gov.oats_gov_name LIKE 'Cariboo%' THEN 'Cariboo Regional District'
                    WHEN oats_gov.oats_gov_name LIKE 'Fraser Valley%' THEN 'Fraser Valley Regional District'
                    WHEN oats_gov.oats_gov_name LIKE 'Columbia Shuswap%' THEN 'Columbia Shuswap Regional District'
                    WHEN oats_gov.oats_gov_name LIKE 'Central Okanagan%' THEN 'Central Okanagan Regional District'
                    WHEN oats_gov.oats_gov_name LIKE 'Squamish Lillooet%' THEN 'Squamish Lillooet Regional District'
                    WHEN oats_gov.oats_gov_name LIKE 'Alberni-Clayoquot%' THEN 'Alberni-Clayoquot Regional District'
                    WHEN oats_gov.oats_gov_name LIKE 'qathet%' THEN 'qathet Regional District'
                    WHEN oats_gov.oats_gov_name LIKE 'Peace River%' THEN 'Peace River Regional District'
                    WHEN oats_gov.oats_gov_name LIKE 'Okanagan Similkameen%' THEN 'Okanagan Similkameen Regional District'
                    WHEN oats_gov.oats_gov_name LIKE 'East Kootenay%' THEN 'East Kootenay Regional District'
                    WHEN oats_gov.oats_gov_name LIKE 'Bulkley-Nechako%' THEN 'Bulkley-Nechako Regional District'
                    WHEN oats_gov.oats_gov_name LIKE 'Sunshine Coast%' THEN 'Sunshine Coast Regional District'
                    WHEN oats_gov.oats_gov_name LIKE 'Nanaimo%' THEN 'Nanaimo Regional District'
                    WHEN oats_gov.oats_gov_name LIKE 'Kitimat Stikine%' THEN 'Kitimat Stikine Regional District'
                    WHEN oats_gov.oats_gov_name LIKE 'North Okanagan%' THEN 'North Okanagan Regional District'
                    WHEN oats_gov.oats_gov_name LIKE 'Fraser Fort George%' THEN 'Fraser Fort George Regional District'
                    WHEN oats_gov.oats_gov_name LIKE 'Cowichan Valley%' THEN 'Cowichan Valley Regional District'
                    WHEN oats_gov.oats_gov_name LIKE 'Kootenay Boundary%' THEN 'Kootenay Boundary Regional District'
                    WHEN oats_gov.oats_gov_name LIKE 'Comox Valley%' THEN 'Comox Valley Regional District'
                    WHEN oats_gov.oats_gov_name LIKE 'Central Kootenay%' THEN 'Central Kootenay Regional District'
                    WHEN oats_gov.oats_gov_name LIKE 'Capital%' THEN 'Capital Regional District'
                    WHEN oats_gov.oats_gov_name LIKE 'Metro Vancouver%' THEN 'Metro Vancouver Regional District'
                    WHEN oats_gov.oats_gov_name LIKE 'Central Coast%' THEN 'Central Coast Regional District'
                    WHEN oats_gov.oats_gov_name LIKE 'North Coast%' THEN 'North Coast Regional District'
                    WHEN oats_gov.oats_gov_name LIKE 'Strathcona%' THEN 'Strathcona Regional District'
                    WHEN oats_gov.oats_gov_name LIKE 'Mount Waddington%' THEN 'Mount Waddington Regional District'
                    ELSE oats_gov.oats_gov_name
                END
            ) = alg."name"
    ),
    -- Step 3: Perform a lookup to retrieve the region code for each application ID
    panel_lookup AS (
        SELECT DISTINCT
            oaap.alr_application_id AS application_id,
            CASE
                WHEN oo2.parent_organization_id IS NULL THEN oo2.organization_name
                WHEN oo3.parent_organization_id IS NULL THEN oo3.organization_name
                ELSE 'NONE'
            END AS panel_region
        FROM
            oats.oats_alr_application_parties oaap
            JOIN oats.oats_person_organizations opo ON oaap.person_organization_id = opo.person_organization_id
            JOIN oats.oats_organizations oo ON opo.organization_id = oo.organization_id
            LEFT JOIN oats.oats_organizations oo2 ON oo.parent_organization_id = oo2.organization_id
            LEFT JOIN oats.oats_organizations oo3 ON oo2.parent_organization_id = oo3.organization_id
        WHERE
            oo2.organization_type_cd = 'PANEL' OR oo3.organization_type_cd = 'PANEL'
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
            LEFT JOIN oats.alcs_etl_application_exclude aee ON oaac.alr_appl_component_id = aee.component_id
        WHERE
            aee.component_id IS NULL
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
	ar.code AS region_code,
    alcs_gov.gov_uuid AS local_government_uuid,
    'oats_etl'
FROM
    oats.oats_alr_applications AS oa
    JOIN oats.alcs_etl_application_duplicate AS ae ON oa.alr_application_id = ae.application_id AND ae.duplicated IS false
    LEFT JOIN applicant_lookup ON oa.alr_application_id = applicant_lookup.application_id
    LEFT JOIN panel_lookup ON oa.alr_application_id = panel_lookup.application_id
    LEFT JOIN application_type_lookup AS atl ON oa.alr_application_id = atl.application_id
	LEFT JOIN alcs.application_region ar ON panel_lookup.panel_region = ar."label"
    LEFT JOIN alcs_gov ON oa.alr_application_id = alcs_gov.application_id
 


