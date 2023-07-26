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