select
    ace.uuid,
    ace.date_closed as chronology_closed_at,
    null::uuid as chronology_closed_by_uuid
from
    alcs.compliance_and_enforcement ace
where
    ace.date_closed is not null;