update
    alcs.compliance_and_enforcement as ace
set 
    chronology_closed_at = v.chronology_closed_at,
    chronology_closed_by_uuid = v.chronology_closed_by_uuid::uuid
from
    (values %s) as v(uuid, chronology_closed_at, chronology_closed_by_uuid)
where
    ace.uuid::text = v.uuid::text;