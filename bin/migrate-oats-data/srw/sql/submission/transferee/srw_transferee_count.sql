SELECT count(*)
FROM oats.oats_alr_application_parties oaap
    JOIN oats.oats_person_organizations opo ON opo.person_organization_id = oaap.person_organization_id
    LEFT JOIN oats.oats_organizations oo ON oo.organization_id = opo.organization_id
    LEFT JOIN oats.oats_persons op ON op.person_id = opo.person_id
    JOIN alcs.notification_submission ns ON ns.file_number = oaap.alr_application_id::TEXT
    AND ns.type_code = 'SRW'
WHERE oaap.alr_appl_role_code = 'APPL';