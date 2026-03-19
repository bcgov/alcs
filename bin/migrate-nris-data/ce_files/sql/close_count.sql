with max_dates as (
    select
        ace.uuid,
        max(ni."date")::timestamptz as date_closed
    from
        alcs.compliance_and_enforcement ace 
        join nris.inspection ni on ni.related_records::text = ace.file_number::text
    where
        ni.reason = 'File Closure'
    group by
        ace.uuid
)
select
    count(*)
from
    max_dates;