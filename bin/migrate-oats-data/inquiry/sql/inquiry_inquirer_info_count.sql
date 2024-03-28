SELECT count(*)
FROM oats.oats_issues oi
    JOIN alcs.inquiry i ON i.file_number = oi.issue_id::TEXT
    JOIN oats.oats_person_organizations opo ON opo.person_organization_id = oi.filed_by_pog_id
    LEFT JOIN oats.oats_persons op ON opo.person_id = op.person_id
    LEFT JOIN oats.oats_organizations oo ON oo.organization_id = opo.organization_id