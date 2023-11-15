SELECT count(*)
FROM oats.OATS_PROPERTY_INTERESTS opi
    JOIN oats.OATS_SUBJECT_PROPERTIES osp ON osp.SUBJECT_PROPERTY_ID = opi.SUBJECT_PROPERTY_ID
    JOIN alcs.notice_of_intent_parcel noip ON noip.oats_subject_property_id = osp.subject_property_id
    JOIN alcs.notice_of_intent_owner noio ON noio.oats_person_organization_id = opi.PERSON_ORGANIZATION_ID
    LEFT JOIN alcs.notice_of_intent_submission nois ON nois."uuid" = noip.notice_of_intent_submission_uuid
WHERE noip.audit_created_by = 'oats_etl'
    AND noio.audit_created_by = 'oats_etl'