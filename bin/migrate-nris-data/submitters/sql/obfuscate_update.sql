update
    alcs.compliance_and_enforcement_submitter as aces
set 
    name = case
        when aces.name <> '' then v.name
        else aces.name
    end,
    email = case
        when aces.email <> '' then v.email
        else aces.email
    end,
    telephone_number = case
        when aces.telephone_number <> '' then v.telephone_number
        else aces.telephone_number
    end,
    affiliation = case
        when aces.affiliation <> '' then v.affiliation
        else aces.affiliation
    end,
    additional_contact_information = case
        when aces.additional_contact_information <> '' then v.additional_contact_information
        else aces.additional_contact_information
    end
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
    aces.uuid::text = v.uuid::text
    and aces.name <> ''
    and aces.email <> ''
    and aces.telephone_number <> ''
    and aces.affiliation <> ''
    and aces.additional_contact_information <> '';