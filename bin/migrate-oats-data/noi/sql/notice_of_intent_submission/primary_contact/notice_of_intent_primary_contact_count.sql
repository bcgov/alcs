WITH ordered_parties AS (
    SELECT oaap.ALR_APPLICATION_ID,
        oaap.person_organization_id,
        op.person_id,
        op.first_name,
        op.last_name,
        oo.organization_id,
        oo.organization_name,
        opo.phone_number,
        opo.cell_phone_number,
        opo.email_address,
        oaap.alr_appl_role_code,
        oaap.expiry_date,
        ROW_NUMBER() OVER (
            PARTITION BY oaap.ALR_APPLICATION_ID
            ORDER BY CASE
                    WHEN oaap.expiry_date > CURRENT_DATE THEN 1
                    WHEN oaap.expiry_date IS NULL THEN 2
                    ELSE 3
                END,
                oaap.expiry_date DESC,
                oaap.person_organization_id
        ) row_num
    FROM oats.oats_alr_application_parties oaap
        JOIN oats.oats_person_organizations opo ON oaap.person_organization_id = opo.person_organization_id
        LEFT JOIN oats.oats_persons op ON opo.PERSON_ID = op.person_id
        LEFT JOIN oats.oats_organizations oo ON oo.organization_id = opo.organization_id
    WHERE oaap.alr_appl_role_code <> 'LG'
)
SELECT count(*)
FROM ordered_parties
    JOIN alcs.notice_of_intent_submission nois ON nois.file_number::bigint = ALR_APPLICATION_ID
WHERE row_num = 1;