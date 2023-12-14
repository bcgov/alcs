SELECT apps."uuid" AS submission_uuid,
    appo."uuid" AS owner_uuid,
    apps.file_number::bigint
FROM oats.oats_alr_application_parties oaap
    JOIN alcs.application_submission apps ON apps.file_number::bigint = oaap.alr_application_id
    JOIN alcs.application_owner appo ON appo.oats_application_party_id = oaap.alr_application_party_id