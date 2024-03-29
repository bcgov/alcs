-- this script selects difference between fields that do not require mapping
WITH appl_components_grouped AS (
    SELECT oaa.alr_application_id
    FROM oats.alcs_etl_applications_nois oaa
    WHERE oaa.application_class_code IN ('LOA', 'BLK', 'SCH', 'NAN') and oaa.alr_change_code <> 'SRW'
),
oats_app_prep_data AS (
    SELECT oaa.alr_application_id,
        oaac.agri_capability_code,
        oaac.agri_cap_map,
        oaac.agri_cap_consultant,
        oaac.component_area,
        oaac.capability_source_code,
        oaac.nonfarm_use_end_date,
        oaac.rsdntl_use_type_code,
        oaac.rsdntl_use_end_date,
        oaa.staff_comment_observations,
        oaac.alr_change_code,
        oaac.exclsn_app_type_code,
        oaac.nonfarm_use_type_code,
        oaac.nonfarm_use_subtype_code,
        onutc.description AS nonfarm_use_type_description,
        onusc.description AS nonfarm_use_subtype_description,
        oaa.legacy_application_nbr,
        -- ALCS has typos fixed and this is required for proper validation
        CASE
            WHEN onusc.description = 'Water Distribtion Systems' THEN 'Water Distribution Systems'
            WHEN onusc.description = 'Tourist Accomodations' THEN 'Tourist Accommodations'
            WHEN onusc.description = 'Office Buiding (Primary Use)' THEN 'Office Building (Primary Use)'
            ELSE onusc.description
        END AS mapped_nonfarm_use_subtype_description,
        CASE
            WHEN oaac.legislation_code = 'SEC_30_1' THEN 'Land Owner'
            WHEN oaac.legislation_code = 'SEC_29_1' THEN 'L/FNG Initiated'
            WHEN oaac.legislation_code = 'SEC_17_3' THEN 'Land Owner'
            WHEN oaac.legislation_code = 'SEC_17_1' THEN 'L/FNG Initiated'
            ELSE oaac.legislation_code
        END AS mapped_legislation,
        split_fee_with_local_gov_ind AS fee_lg,
        fee_received_date AS fee_date,
        fee_waived_ind AS fee_waived,
        applied_fee_amt AS fee_amount
    FROM appl_components_grouped acg
        JOIN oats.oats_alr_appl_components oaac ON oaac.alr_application_id = acg.alr_application_id
        JOIN oats.oats_alr_applications oaa ON oaa.alr_application_id = acg.alr_application_id
        JOIN oats.oats_nonfarm_use_subtype_codes onusc ON onusc.nonfarm_use_subtype_code = oaac.nonfarm_use_subtype_code
        AND oaac.nonfarm_use_type_code = onusc.nonfarm_use_type_code
        JOIN oats.oats_nonfarm_use_type_codes onutc ON onutc.nonfarm_use_type_code = oaac.nonfarm_use_type_code
)
SELECT oapd.alr_application_id,
    a.alr_area,
    a.ag_cap,
    a.ag_cap_source,
    a.ag_cap_map,
    a.ag_cap_consultant,
    a.staff_observations,
    a.nfu_use_type,
    a.nfu_use_sub_type,
    oapd.component_area,
    oapd.agri_capability_code,
    oapd.capability_source_code,
    oapd.agri_cap_map,
    oapd.agri_cap_consultant,
    oapd.staff_comment_observations,
    oapd.nonfarm_use_type_description,
    oapd.mapped_nonfarm_use_subtype_description,
    oapd.mapped_legislation,
    oapd.fee_date,
    oapd.fee_amount,
    a.fee_split_with_lg,
    oapd.fee_lg,
    oapd.fee_waived,
    a.fee_waived,
    oapd.legacy_application_nbr,
    a.legacy_id
FROM alcs.application a
    LEFT JOIN oats_app_prep_data AS oapd ON a.file_number = oapd.alr_application_id::TEXT
WHERE a.alr_area != oapd.component_area
    OR a.ag_cap_map != oapd.agri_cap_map
    OR a.ag_cap_consultant != oapd.agri_cap_consultant
    OR a.staff_observations != oapd.staff_comment_observations
    OR a.nfu_use_sub_type != oapd.mapped_nonfarm_use_subtype_description
    OR a.incl_excl_applicant_type != oapd.mapped_legislation
    OR a.fee_amount != oapd.fee_amount
    OR a.legacy_id != oapd.legacy_application_nbr::text