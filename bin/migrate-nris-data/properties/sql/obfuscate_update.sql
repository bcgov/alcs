update
    alcs.compliance_and_enforcement_property as acep
set 
    alc_history = v.alc_history
from
    (values %s) as v(
        uuid,
        alc_history
    )
where
    acep.uuid::text = v.uuid::text;