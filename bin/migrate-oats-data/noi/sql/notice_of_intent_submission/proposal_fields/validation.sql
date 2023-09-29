------ validation queries
--- Use this query to manually validate that data mapped properly. Execute in DB IDE of your choice
-- validate applicant
SELECT *
FROM alcs.notice_of_intent noi
    JOIN alcs.notice_of_intent_submission nois ON noi.file_number = nois.file_number
WHERE noi.applicant != nois.applicant;
-- validate local_government
SELECT *
FROM alcs.notice_of_intent noi
    JOIN alcs.notice_of_intent_submission nois ON noi.file_number = nois.file_number
WHERE noi.local_government_uuid != nois.local_government_uuid;
-- validate type_code
SELECT *
FROM alcs.notice_of_intent noi
    JOIN alcs.notice_of_intent_submission nois ON noi.file_number = nois.file_number
WHERE noi.type_code != nois.type_code;
-- validate proposal and default soil fields
SELECT nois.soil_has_submitted_notice,
    oaa.followup_noi_number
FROM oats.oats_alr_applications oaa
    JOIN alcs.notice_of_intent_submission nois ON nois.file_number = oaa.alr_application_id::TEXT
WHERE (
        nois.purpose IS NULL
        AND (
            oaa.proposal_summary_desc IS NOT NULL
            OR proposal_background_desc IS NOT NULL
        )
    )
    OR (
        nois.parcels_agriculture_description != oaa.current_land_use_desc
    )
    OR (
        nois.parcels_agriculture_improvement_description != oaa.agricultural_improvement_desc
    )
    OR (
        nois.parcels_non_agriculture_use_description != oaa.non_agricultural_uses_desc
    )
    OR (
        nois.soil_is_follow_up != CASE
            WHEN oaa.ministry_notice_ref_no IS NOT NULL THEN TRUE
            ELSE FALSE
        END
    )
    OR (
        nois.soil_follow_up_ids != oaa.followup_noi_number::TEXT
    )
    OR (
        nois.soil_has_submitted_notice != CASE
            WHEN oaa.followup_noi_number IS NOT NULL THEN TRUE
            ELSE FALSE
        END
    )
    OR soil_is_extraction_or_mining != FALSE
    OR soil_is_removing_soil_for_new_structure != FALSE
    OR soil_is_area_wide_filling != FALSE;