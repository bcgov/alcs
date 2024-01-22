SELECT nois."uuid" AS submission_uuid,
    noio."uuid" AS owner_uuid,
    nois.file_number::bigint
FROM oats.oats_alr_application_parties oaap
    JOIN alcs.notice_of_intent_submission nois ON nois.file_number::bigint = oaap.alr_application_id
    JOIN alcs.notice_of_intent_owner noio ON noio.oats_application_party_id = oaap.alr_application_party_id