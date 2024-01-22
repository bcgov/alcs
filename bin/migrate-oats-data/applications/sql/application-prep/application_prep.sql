WITH appl_components_grouped AS (
    SELECT oaa.alr_application_id
    FROM oats.alcs_etl_applications_nois oaa
    WHERE oaa.application_class_code IN ('LOA', 'BLK', 'SCH', 'NAN')
        and oaa.alr_change_code <> 'SRW'
)
SELECT oaa.alr_application_id,
    oaac.agri_capability_code,
    oaac.agri_cap_map,
    oaac.agri_cap_consultant,
    oaac.component_area,
    oaac.capability_source_code,
    oaac.nonfarm_use_type_code,
    oaac.nonfarm_use_subtype_code,
    oaac.nonfarm_use_end_date,
    oaac.rsdntl_use_type_code,
    oaac.rsdntl_use_end_date,
    oaac.exclsn_app_type_code,
    oaa.staff_comment_observations,
    oaac.alr_change_code,
    oaac.legislation_code,
    oaa.applied_fee_amt,
    oaa.split_fee_with_local_gov_ind,
    oaa.fee_waived_ind,
    oaa.fee_received_date,
    oaa.legacy_application_nbr,
    oaa.submitted_to_alc_date
FROM appl_components_grouped acg
    JOIN oats.oats_alr_appl_components oaac ON oaac.alr_application_id = acg.alr_application_id
    JOIN oats.oats_alr_applications oaa ON oaa.alr_application_id = acg.alr_application_id