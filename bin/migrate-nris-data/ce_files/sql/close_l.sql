update
    alcs.compliance_and_enforcement as ace
set 
    date_closed = v.date_closed
from
    (values %s) as v(uuid, date_closed)
where
    ace.uuid::text = v.uuid::text;