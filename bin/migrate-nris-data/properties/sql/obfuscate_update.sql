update
    alcs.compliance_and_enforcement_property as acep
set 
    alc_history = case
        when acep.alc_history <> '' then v.alc_history
        else acep.alc_history
    end
from
    (values %s) as v(
        uuid,
        alc_history
    )
where
    acep.uuid::text = v.uuid::text;