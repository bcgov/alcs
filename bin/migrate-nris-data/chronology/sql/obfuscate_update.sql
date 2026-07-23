update
    alcs.compliance_and_enforcement_chronology_entry as acece
set 
    description = v.description
from
    (values %s) as v(uuid, description)
where
    acece.uuid::text = v.uuid::text;