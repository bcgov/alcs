update
    alcs.compliance_and_enforcement as ace
set 
    intake_notes = v.intake_notes
from
    (values %s) as v(uuid, intake_notes)
where
    ace.uuid::text = v.uuid::text;