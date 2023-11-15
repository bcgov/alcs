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
        oaap.alr_application_party_id,
        ROW_NUMBER() OVER (
            PARTITION BY oaap.ALR_APPLICATION_ID
            ORDER BY CASE
                    WHEN oaap.alr_appl_role_code = 'AGENT'
                    AND oaap.expiry_date > CURRENT_DATE THEN 1
                    WHEN oaap.alr_appl_role_code = 'AGENT'
                    AND oaap.expiry_date IS NULL THEN 2
                    WHEN oaap.alr_appl_role_code = 'AGENT' THEN 3
                    WHEN oaap.alr_appl_role_code = 'APPL'
                    AND oaap.expiry_date > CURRENT_DATE THEN 4
                    WHEN oaap.alr_appl_role_code = 'APPL'
                    AND oaap.expiry_date IS NULL THEN 5
                    WHEN oaap.alr_appl_role_code = 'APPL' THEN 6
                    ELSE 7
                END,
                oaap.expiry_date DESC
        ) row_num
    FROM oats.oats_alr_application_parties oaap
        JOIN oats.oats_person_organizations opo ON oaap.person_organization_id = opo.person_organization_id
        LEFT JOIN oats.oats_persons op ON opo.PERSON_ID = op.person_id
        LEFT JOIN oats.oats_organizations oo ON oo.organization_id = opo.organization_id
    WHERE oaap.alr_appl_role_code <> 'LG'
),
parties_with_submission_uuid as (
    SELECT ALR_APPLICATION_ID,
        person_organization_id,
        person_id,
        first_name,
        last_name,
        organization_id,
        organization_name,
        phone_number,
        cell_phone_number,
        email_address,
        alr_appl_role_code,
        expiry_date,
        nois."uuid" AS notice_of_intent_submission_uuid,
        alr_application_party_id,
        row_num
    FROM ordered_parties
        JOIN alcs.notice_of_intent_submission nois ON nois.file_number::bigint = ALR_APPLICATION_ID
),
parties_ordered_by_priority as (
    SELECT *,
        ROW_NUMBER() OVER(
            PARTITION BY ALR_APPLICATION_ID
            ORDER BY row_num
        ) priority
    FROM parties_with_submission_uuid
)
SELECT *
FROM parties_ordered_by_priority
WHERE priority = 1