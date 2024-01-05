SELECT
    olgr.local_gov_file_number,
    olgr.alr_application_id,
    olgr.zoning_compliance_ind,
    olgr.zoning_bylaw_name,
    olgr.zoning_designation,
    olgr.minimum_lot_hectares,
    olgr.community_pln_compliance_ind,
    olgr.community_pln_bylaw_name,
    olgr.community_pln_designation,
    olgr.contact_department,
    op.first_name,
    op.last_name,
    op.title,
    opo.phone_number,
    opo.email_address
FROM
    alcs.application_submission as2
    JOIN oats.oats_local_government_reports olgr ON as2.file_number = olgr.alr_application_id::TEXT
    LEFT JOIN oats.oats_person_organizations opo ON olgr.person_organization_id = opo.person_organization_id
    LEFT JOIN oats.oats_persons op ON opo.person_id = op.person_id
