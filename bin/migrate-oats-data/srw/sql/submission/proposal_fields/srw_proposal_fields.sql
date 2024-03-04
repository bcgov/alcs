SELECT oaa.alr_application_id,
    oaa.applicant_file_no,
    n.summary,
    CASE
        WHEN oaa.plan_no IS NOT NULL
        OR oaa.control_no IS NOT NULL THEN TRUE
        ELSE FALSE
    END AS has_survey_plan,
    au."uuid",
    oaac.component_area
FROM oats.oats_alr_applications oaa
    JOIN alcs.notification_submission nos ON nos.file_number = oaa.alr_application_id::TEXT AND type_code = 'SRW'
    JOIN alcs.notification n ON n.file_number = nos.file_number
    JOIN oats.alcs_etl_srw aes ON aes.alr_application_id = oaa.alr_application_id
    JOIN oats.oats_alr_appl_components oaac ON oaac.alr_appl_component_id = aes.alr_appl_component_id
    LEFT JOIN alcs."user" au ON oaa.created_guid = au.bceid_guid