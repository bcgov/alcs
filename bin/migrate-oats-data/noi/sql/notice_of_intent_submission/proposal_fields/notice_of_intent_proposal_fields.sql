SELECT oaa.alr_application_id,
    oaa.proposal_summary_desc,
    oaa.proposal_background_desc,
    oaa.current_land_use_desc,
    oaa.agricultural_improvement_desc,
    oaa.non_agricultural_uses_desc,
    oaa.followup_noi_number,
    oaa.ministry_notice_ref_no,
    au."uuid"
FROM oats.oats_alr_applications oaa
    JOIN alcs.notice_of_intent_submission nois ON nois.file_number = oaa.alr_application_id::TEXT
    LEFT JOIN alcs."user" au ON oaa.created_guid = au.bceid_guid