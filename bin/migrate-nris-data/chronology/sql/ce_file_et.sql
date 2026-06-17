select
    'nris_etl' as audit_created_by,
    now() as date,
    null as author_uuid,
    'Migrated from NRIS, please find any previous file history in the LAN folder' as description,
    ace.uuid as file_uuid
from
    alcs.compliance_and_enforcement ace;