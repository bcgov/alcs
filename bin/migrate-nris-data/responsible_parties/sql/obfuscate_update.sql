update
    alcs.compliance_and_enforcement_responsible_party as acerp
set 
    individual_name = v.individual_name
from
    (values %s) as v(
        uuid,
        individual_name
    )
where
    acerp.uuid::text = v.uuid::text;