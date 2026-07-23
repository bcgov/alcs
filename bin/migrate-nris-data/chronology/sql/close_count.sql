select
    count(*)
from
    alcs.compliance_and_enforcement ace
where
    ace.date_closed is not null;