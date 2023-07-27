-- this script selects difference between fields that do not require mapping
WITH appl_components_grouped AS (
    SELECT oaac.alr_application_id
    FROM oats.oats_alr_appl_components oaac
        JOIN oats.oats_alr_applications oaa ON oaa.alr_application_id = oaac.alr_application_id
    WHERE oaa.application_class_code IN ('LOA', 'BLK')
    GROUP BY oaac.alr_application_id
    HAVING count(oaac.alr_application_id) < 2 -- ignore all applications wit multiple components
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
        -- ALCS has typos fixed and this is required for proper validation
        CASE
            WHEN onusc.description = 'Water Distribtion Systems' THEN 'Water Distribution Systems'
            WHEN onusc.description = 'Tourist Accomodations' THEN 'Tourist Accommodations'
            WHEN onusc.description = 'Office Buiding (Primary Use)' THEN 'Office Building (Primary Use)'
            ELSE onusc.description
        END AS mapped_nonfarm_use_subtype_description
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
    oapd.mapped_nonfarm_use_subtype_description
FROM alcs.application a
    LEFT JOIN oats_app_prep_data AS oapd ON a.file_number = oapd.alr_application_id::TEXT
WHERE a.alr_area != oapd.component_area
    OR a.ag_cap_map != oapd.agri_cap_map
    OR a.ag_cap_consultant != oapd.agri_cap_consultant
    OR a.staff_observations != oapd.staff_comment_observations
    OR a.nfu_use_sub_type != oapd.mapped_nonfarm_use_subtype_description