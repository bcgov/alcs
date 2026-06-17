update
    alcs.compliance_and_enforcement_submitter as aces
set 
    name = v.name,
    email = v.email,
    telephone_number = v.telephone_number,
    affiliation = v.affiliation,
    additional_contact_information = v.additional_contact_information
from
    (values %s) as v(
        uuid,
        name,
        email,
        telephone_number,
        affiliation,
        additional_contact_information
    )
where
    aces.uuid::text = v.uuid::text;