-- this script selects difference between fields that do not require mapping
WITH nois_with_one_or_zero_component_only AS (
    SELECT oaac.alr_application_id
    FROM oats.oats_alr_appl_components oaac
    GROUP BY oaac.alr_application_id
    HAVING count(oaac.alr_application_id) < 2
),
oats_noi_data AS (
    SELECT oaa.alr_application_id,
        oaac.agri_capability_code,
        oaac.agri_cap_map,
        oaac.agri_cap_consultant,
        oaac.component_area,
        oaac.capability_source_code,
        oaa.staff_comment_observations,
        oaac.alr_change_code,
        split_fee_with_local_gov_ind AS fee_lg,
        fee_received_date AS fee_date,
        fee_waived_ind AS fee_waived,
        applied_fee_amt AS fee_amount,
        oaa.legacy_application_nbr
    FROM alcs.notice_of_intent noi
        JOIN nois_with_one_or_zero_component_only oats_noi ON oats_noi.alr_application_id::TEXT = noi.file_number
        JOIN oats.oats_alr_applications oaa ON oaa.alr_application_id = oats_noi.alr_application_id
        AND oaa.application_class_code = 'NOI'
        JOIN oats.oats_alr_appl_components oaac ON oaac.alr_application_id = oats_noi.alr_application_id
)
SELECT oats_noi.alr_application_id,
    noi.alr_area,
    noi.ag_cap,
    noi.ag_cap_source,
    noi.ag_cap_map,
    noi.ag_cap_consultant,
    staff_observations,
    oats_noi.component_area,
    oats_noi.agri_capability_code,
    oats_noi.capability_source_code,
    oats_noi.agri_cap_map,
    oats_noi.agri_cap_consultant,
    oats_noi.staff_comment_observations,
    oats_noi.fee_date,
    oats_noi.fee_amount,
    noi.fee_split_with_lg,
    oats_noi.fee_lg,
    oats_noi.fee_waived,
    noi.fee_waived,
    noi.legacy_id,
    oats_noi.legacy_application_nbr
FROM alcs.notice_of_intent noi
    LEFT JOIN oats_noi_data AS oats_noi ON noi.file_number = oats_noi.alr_application_id::TEXT
WHERE noi.alr_area != oats_noi.component_area
    OR noi.ag_cap_map != oats_noi.agri_cap_map
    OR noi.ag_cap_consultant != oats_noi.agri_cap_consultant
    OR noi.staff_observations != oats_noi.staff_comment_observations
    OR noi.fee_amount != oats_noi.fee_amount
    OR noi.fee_split_with_lg::bool != oats_noi.fee_lg::bool
    OR noi.fee_waived::bool != oats_noi.fee_waived::bool
    OR noi.legacy_id != oats_noi.legacy_application_nbr::text