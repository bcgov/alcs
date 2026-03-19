select
    count(*)
from
    alcs.compliance_and_enforcement ace 
    join nris.inspection ni on ni.related_records::text = ace.file_number::text
where
    ni.reason = 'File Closure';