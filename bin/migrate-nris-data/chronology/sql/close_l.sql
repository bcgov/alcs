update
    alcs.compliance_and_enforcement as ace
set 
    chronology_closed_at = v.chronology_closed_at
from
    (values %s) as v(uuid, chronology_closed_at)
where
    ace.uuid::text = v.uuid::text;