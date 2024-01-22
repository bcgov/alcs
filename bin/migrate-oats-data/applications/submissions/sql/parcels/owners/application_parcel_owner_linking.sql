SELECT apps.file_number,
    appp."uuid" AS parcel_uuid,
    appp.oats_subject_property_id,
    appo."uuid" AS owner_uuid,
    appo.oats_person_organization_id
FROM oats.OATS_PROPERTY_INTERESTS opi
    JOIN oats.OATS_SUBJECT_PROPERTIES osp ON osp.SUBJECT_PROPERTY_ID = opi.SUBJECT_PROPERTY_ID
    JOIN alcs.application_parcel appp ON appp.oats_subject_property_id = osp.subject_property_id
    AND appp.oats_property_id = osp.property_id
    JOIN alcs.application_owner appo ON appo.oats_person_organization_id = opi.PERSON_ORGANIZATION_ID
    AND appo.oats_property_interest_id = opi.property_interest_id
    LEFT JOIN alcs.application_submission apps ON apps."uuid" = appp.application_submission_uuid
WHERE appp.audit_created_by = 'oats_etl'
    AND appo.audit_created_by = 'oats_etl'