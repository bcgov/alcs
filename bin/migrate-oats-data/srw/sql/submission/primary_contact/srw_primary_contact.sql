WITH ranked_contacts AS (
    SELECT oaap.alr_application_id,
        oaap.alr_application_party_id,
        op.person_id,
        op.first_name,
        op.last_name,
        op.middle_name,
        op.title,
        oo.organization_id,
        oo.organization_name,
        oo.alias_name,
        opo.phone_number,
        opo.cell_phone_number,
        opo.email_address,
        oaap.alr_appl_role_code,
        ns."uuid" AS notification_submission_uuid,
        ROW_NUMBER() OVER (
            PARTITION BY alr_application_id
            ORDER BY alr_appl_role_code,
                oaap.when_created
        ) AS rn
    FROM oats.oats_alr_application_parties oaap
        JOIN oats.oats_person_organizations opo ON opo.person_organization_id = oaap.person_organization_id
        LEFT JOIN oats.oats_organizations oo ON oo.organization_id = opo.organization_id
        LEFT JOIN oats.oats_persons op ON op.person_id = opo.person_id
        JOIN alcs.notification_submission ns ON ns.file_number = oaap.alr_application_id::TEXT
        AND ns.type_code = 'SRW'
    WHERE oaap.alr_appl_role_code in ('AGENT', 'APPL')
)
SELECT *
FROM ranked_contacts
WHERE rn = 1