SELECT count(*)
FROM alcs.application_submission as2
    JOIN oats.oats_local_government_reports olgr ON as2.file_number = olgr.alr_application_id::TEXT
    LEFT JOIN oats.oats_person_organizations opo ON olgr.person_organization_id = opo.person_organization_id
    LEFT JOIN oats.oats_persons op ON opo.person_id = op.person_id
    LEFT JOIN oats.oats_accomplishments oa ON oa.alr_application_id = olgr.alr_application_id
    AND oa.accomplishment_code IN ('LRF', 'SAL') -- LRF AND SAL self exclusive