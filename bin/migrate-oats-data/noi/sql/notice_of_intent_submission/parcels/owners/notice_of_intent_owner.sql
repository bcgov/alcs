-- retrieve owners per parcel
SELECT osp.subject_property_id,
    opo.person_organization_id,
    op.person_id,
    op.first_name,
    op.last_name,
    op.middle_name,
    oo.organization_id,
    oo.organization_name,
    opo.phone_number,
    opo.cell_phone_number,
    opo.email_address,
    noip.ownership_type_code,
    opi.prin_type,
    opi.active_ind,
    noip.notice_of_intent_submission_uuid,
    opi.property_interest_id
FROM oats.OATS_PROPERTY_INTERESTS opi
    JOIN oats.OATS_SUBJECT_PROPERTIES osp ON osp.SUBJECT_PROPERTY_ID = opi.SUBJECT_PROPERTY_ID
    JOIN alcs.notice_of_intent_parcel noip ON noip.oats_subject_property_id = osp.subject_property_id -- ensure GET records only for parcels imported into ALCS
    JOIN oats.OATS_PERSON_ORGANIZATIONS opo ON opo.PERSON_ORGANIZATION_ID = opi.PERSON_ORGANIZATION_ID
    LEFT JOIN oats.OATS_PERSONS op ON op.PERSON_ID = opo.PERSON_ID
    LEFT JOIN oats.oats_organizations oo ON oo.organization_id = opo.organization_id