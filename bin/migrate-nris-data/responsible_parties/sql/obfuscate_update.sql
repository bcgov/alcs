update
    alcs.compliance_and_enforcement_responsible_party as acerp
set 
    individual_name = case
        when acerp.individual_name is not null or acerp.individual_name <> '' then v.individual_name
        else acerp.individual_name
    end
from
    (values %s) as v(
        uuid,
        individual_name
    )
where
    acerp.uuid::text = v.uuid::text;