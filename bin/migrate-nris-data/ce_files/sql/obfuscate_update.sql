update
    alcs.compliance_and_enforcement as ace
set 
    intake_notes = case
        when ace.intake_notes <> '' then v.intake_notes
        else ace.intake_notes
    end
from
    (values %s) as v(uuid, intake_notes)
where
    ace.uuid::text = v.uuid::text
    and ace.intake_notes <> '';