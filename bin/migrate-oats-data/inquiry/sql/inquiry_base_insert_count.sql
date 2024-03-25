-- Step 1: get local gov application name & match to uuid
WITH oats_gov AS (
    SELECT oi.issue_id,
        TRIM(oo.organization_name) AS oats_gov_name
    FROM oats.oats_issues oi
        JOIN oats.oats_person_organizations opo ON opo.person_organization_id = oi.local_gov_pog_id
        JOIN oats.oats_organizations oo ON opo.organization_id = oo.organization_id
    WHERE oo.organization_type_cd IN ('MUNI', 'FN', 'RD', 'RM')
        AND issu_type = 'INQ'
),
trimed_alcs_gov AS (
    SELECT TRIM(lg."name") AS name,
        lg.uuid
    FROM alcs.local_government lg
),
alcs_gov AS (
    SELECT oats_gov.issue_id AS issue_id,
        alg.uuid AS gov_uuid,
        alg."name" AS gov_name
    FROM oats_gov
        JOIN trimed_alcs_gov alg on (
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
                WHEN oats_gov.oats_gov_name LIKE 'Comox-Strathcona (Historical)' THEN 'Comox-Strathcona Regional District (Historical)'
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
-- Step 2: Perform a lookup to retrieve the region code for each issue ID
panel_lookup AS (
    SELECT DISTINCT oi.issue_id,
        CASE
            WHEN oo2.parent_organization_id IS NULL THEN oo2.organization_name
            WHEN oo3.parent_organization_id IS NULL THEN oo3.organization_name
            ELSE 'NONE'
        END AS panel_region
    FROM oats.oats_issues oi
        JOIN oats.oats_person_organizations opo ON oi.local_gov_pog_id = opo.person_organization_id
        JOIN oats.oats_organizations oo ON opo.organization_id = oo.organization_id
        LEFT JOIN oats.oats_organizations oo2 ON oo.parent_organization_id = oo2.organization_id
        LEFT JOIN oats.oats_organizations oo3 ON oo2.parent_organization_id = oo3.organization_id
    WHERE oo2.organization_type_cd = 'PANEL'
        OR oo3.organization_type_cd = 'PANEL'
)
SELECT count(*)
FROM oats.oats_issues oi
    JOIN panel_lookup ON panel_lookup.issue_id = oi.issue_id
    JOIN alcs_gov ON alcs_gov.issue_id = oi.issue_id
WHERE oi.issu_type = 'INQ';