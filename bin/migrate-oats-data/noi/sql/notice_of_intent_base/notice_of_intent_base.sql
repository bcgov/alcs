WITH nois_with_one_or_zero_component_only AS (
    SELECT oaac.alr_application_id
    FROM oats.oats_alr_appl_components oaac
    GROUP BY oaac.alr_application_id
    HAVING count(oaac.alr_application_id) < 2
)
SELECT oaa.fee_waived_ind,
    oaa.split_fee_with_local_gov_ind,
    oaa.applied_fee_amt,
    oaa.fee_received_date,
    oaa.alr_application_id,
    oaa.submitted_to_alc_date,
    oaa.staff_comment_observations,
    oaac.alr_change_code,
    oaac.alr_appl_component_id,
    oaac.component_area,
    oaac.capability_source_code,
    oaac.agri_cap_map,
    oaac.agri_cap_consultant,
    oaac.agri_capability_code,
    oaa.legacy_application_nbr,
    oaac.nonfarm_use_end_date
FROM alcs.notice_of_intent noi
    JOIN nois_with_one_or_zero_component_only oats_noi ON oats_noi.alr_application_id::TEXT = noi.file_number
    JOIN oats.oats_alr_applications oaa ON oaa.alr_application_id = oats_noi.alr_application_id
    AND oaa.application_class_code = 'NOI'
    JOIN oats.oats_alr_appl_components oaac ON oaac.alr_application_id = oats_noi.alr_application_id