select
    count(*)
from
    nris.inspection ni
    join alcs.compliance_and_enforcement ace on ace.file_number::text = ni.related_records::text;