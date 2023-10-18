-- this script selects difference between fields that do not require mapping
WITH apps_with_one_or_zero_component_only AS (
    SELECT oaac.alr_application_id
    FROM oats.oats_alr_appl_components oaac
    GROUP BY oaac.alr_application_id
    HAVING count(oaac.alr_application_id) < 2
),
oats_app_data AS (
    SELECT oaa.alr_application_id,
        oaac.alr_change_code
        oaac.rsdntl_use_type_code,
        oaac.infra_desc,
        oaac.cur_struc_desc,
        oaac.component_area,
        oaac.support_desc,
        oaa.tour_env_desc,
        oaac.agricultural_activities_desc,
        oaac.impact_reduction_desc,
        oaac.owners_notified_ind,
        oaac.applicationshare_ind,
        oaac.improvements_desc,
        oaa.proposal_summary_desc,
        oaa.proposal_background_desc,
        oaa.current_land_use_desc,
        oaa.non_agricultural_uses_desc,
        oaa.agricultural_improvement_desc,
        oaac.homesite_severance_ind
    FROM alcs.application_submission app_sub
        JOIN apps_with_one_or_zero_component_only oats_asub ON oats_asub.alr_application_id::TEXT = app_sub.file_number
        JOIN oats.oats_alr_applications oaa ON oaa.alr_application_id = oats_asub.alr_application_id
        AND oaa.application_class_code = 'LOA' OR oaa.application_class_code = 'BLK'
        JOIN oats.oats_alr_appl_components oaac ON oaac.alr_application_id = oats_asub.alr_application_id
)
SELECT oats_app.alr_application_id,
    as2.purpose,
    as2.parcels_agriculture_improvement_description,
    as2.parcels_agriculture_description,
    as2.parcels_non_agriculture_use_description,
    as2.naru_infrastructure,
    as2.file_number,
    oats_app.proposal_summary_desc,
    oats_app.agricultural_improvement_desc,
    oats_app.current_land_use_desc,
    oats_app.non_agricultural_uses_desc,
    oats_app.infra_desc
FROM alcs.application_submission as2
    LEFT JOIN oats_app_data AS oats_app ON as2.file_number = oats_app.alr_application_id::TEXT
WHERE as2.purpose != oats_app.proposal_summary_desc
    OR as2.parcels_agriculture_improvement_description != oats_app.agricultural_improvement_desc
    OR as2.parcels_agriculture_description != oats_app.current_land_use_desc
    OR as2.parcels_non_agriculture_use_description != oats_app.non_agricultural_uses_desc
    OR as2.naru_infrastructure != oats_app.infra_desc