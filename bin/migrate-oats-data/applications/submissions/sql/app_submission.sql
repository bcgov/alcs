WITH
    appl_components_grouped AS (
        SELECT
            oaac.alr_application_id
        FROM
            oats.oats_alr_appl_components oaac
            JOIN oats.oats_alr_applications oaa ON oaa.alr_application_id = oaac.alr_application_id
        WHERE
            oaa.application_class_code IN ('LOA', 'BLK')
        GROUP BY
            oaac.alr_application_id
        HAVING
            count(oaac.alr_application_id) < 2 -- ignore all applications wit multiple components
    )
SELECT
    aa.file_number,
    aa.type_code,
    aa.local_government_uuid,
    oc.alr_change_code,
    acg.alr_application_id,
    aa.applicant,
    aa.alr_area,
    oc.alr_appl_component_id,
    oc.rsdntl_use_type_code,
    oc.infra_desc,
    oc.cur_struc_desc,
    oc.support_desc,
    oc.tour_env_desc,
    oc.sleeping_units,
    oc.component_area,
    oa.proposal_summary_desc,
    oa.proposal_background_desc,
    oc.agricultural_activities_desc,
    oc.impact_reduction_desc,
    oc.owners_notified_ind,
    oc.applicationshare_ind,
    oc.improvements_desc,
    oc.homesite_severance_ind,
    oa.current_land_use_desc,
    oa.non_agricultural_uses_desc,
    oa.agricultural_improvement_desc,
    oa.followup_noi_ind,
    oa.followup_noi_number,
    oa.created_guid,
    oa.ministry_notice_ind
FROM
    appl_components_grouped acg
    LEFT JOIN alcs.application aa ON aa.file_number = acg.alr_application_id::TEXT
    JOIN oats.oats_alr_appl_components oc ON acg.alr_application_id = oc.alr_application_id
    JOIN oats.oats_alr_applications oa ON acg.alr_application_id = oa.alr_application_id