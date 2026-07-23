with reduced as (
    -- Shouldn't be more than 3 related records
    select
        distinct i.*,
        split_part(i.related_records, ';', '1') related_record
    from
        nris.inspection i
        join nris.complaint c on c.record_id = split_part(i.related_records, ';', '1')
    union
    select
        distinct i.*,
        split_part(i.related_records, ';', '2') related_record
    from
        nris.inspection i
        join nris.complaint c on c.record_id = split_part(i.related_records, ';', '2')
    union
    select
        distinct i.*,
        split_part(i.related_records, ';', '3') related_record
    from
        nris.inspection i
        join nris.complaint c on c.record_id = split_part(i.related_records, ';', '3')
)
update
    nris.inspection i
set
    related_records = r.related_record
from
    reduced r
where
    i.record_id = r.record_id
-- Return for count
returning 1;
