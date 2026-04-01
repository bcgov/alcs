select distinct
    'nris_etl' as audit_created_by,
    ni.date::timestamptz as date,
    au.uuid as author_uuid,
    ''''||ni.reason||''' inspection (NRIS '||ni.record_id||'), please consult LAN folder for record' as description,
    ace.uuid as file_uuid,
    ni.record_id as nris_inspection_id
from
    nris.inspection ni
    join alcs.compliance_and_enforcement ace on ace.file_number::text = ni.related_records::text
    left join alcs.user au on lower(au.idir_user_name) = lower(split_part(ni.c_e_officer, '/', 2));